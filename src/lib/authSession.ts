import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

/**
 * Verified sessions.
 *
 * A session is proof that a browser controls an email address — established by
 * the OTP flow in /api/auth. Before this existed, any request could simply
 * claim an address, which meant knowing a customer's email was enough to use
 * their Pro.
 *
 * The token is a stateless HMAC rather than a Redis-backed session id: the
 * routes that read it already make a Redis call for the entitlement, and this
 * keeps it to one. The trade-off is that individual sessions can't be revoked —
 * rotating AUTH_SECRET signs everyone out at once.
 */

const COOKIE_NAME = "fluent_session";
const SESSION_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
/** Re-issue once a token is older than this, so active users never expire. */
const REFRESH_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export interface Session {
  email: string;
}

interface SessionPayload {
  email: string;
  /** Issued at (epoch ms). */
  iat: number;
  /** Expires at (epoch ms). */
  exp: number;
}

/**
 * Fails closed when unset — same stance as ADMIN_SECRET in lib/adminAuth.ts.
 * Without a secret there is no way to tell a real token from a forged one.
 */
function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    console.error("[auth] AUTH_SECRET is not set — refusing all sessions.");
    return null;
  }

  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encode(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

/** Returns the payload only when the signature checks out and it hasn't expired. */
function decode(token: string): SessionPayload | null {
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body, secret);

  // Compare in constant time. Length is checked first because timingSafeEqual
  // throws on a mismatch — and the signature's length isn't secret.
  if (signature.length !== expected.length) {
    return null;
  }
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
  } catch {
    return null;
  }

  if (
    typeof payload.email !== "string" ||
    typeof payload.exp !== "number" ||
    payload.exp <= Date.now()
  ) {
    return null;
  }

  return payload;
}

function buildToken(email: string, now = Date.now()): string | null {
  const secret = getSecret();
  if (!secret) {
    return null;
  }

  return encode({ email, iat: now, exp: now + SESSION_MS }, secret);
}

/**
 * Cookie options. `sameSite: "lax"` keeps the cookie off cross-site POSTs,
 * which is what stands in for a CSRF token here. `secure` is relaxed in dev so
 * the flow works over plain http on localhost.
 */
function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(SESSION_MS / 1000),
  };
}

/** Issues a session for an address whose ownership has just been proven. */
export async function startSession(email: string): Promise<boolean> {
  const token = buildToken(email);
  if (!token) {
    return false;
  }

  const store = await cookies();
  store.set(COOKIE_NAME, token, cookieOptions());
  return true;
}

/** The verified address for this request, or null when there isn't one. */
export async function readSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = decode(token);
  return payload ? { email: payload.email } : null;
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Slides the expiry for someone who is still active. Safe to call from any
 * route handler; does nothing when there's no session or it's still fresh.
 */
export async function refreshSessionIfStale(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) {
    return;
  }

  const payload = decode(token);
  if (!payload || Date.now() - payload.iat < REFRESH_AFTER_MS) {
    return;
  }

  const refreshed = buildToken(payload.email);
  if (refreshed) {
    store.set(COOKIE_NAME, refreshed, cookieOptions());
  }
}
