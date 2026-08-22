import { createHash, randomInt } from "node:crypto";

import { getRedis } from "@/lib/redis";
import { normalizeEmail } from "@/lib/validateEmail";

/**
 * One-time codes emailed to prove control of an address.
 *
 * The code itself is never stored — only its SHA-256, the same way license
 * keys are cached in lib/license.ts. A Redis dump therefore doesn't hand
 * anyone a working login.
 */

const CODE_PREFIX = "fluent-auth-code:";
const TTL_SECONDS = 10 * 60;
/** 10^6 combinations, so guessing has to be capped tightly. */
const MAX_ATTEMPTS = 5;

interface StoredCode {
  hash: string;
  attempts: number;
}

const codeKey = (email: string) => `${CODE_PREFIX}${normalizeEmail(email)}`;

const hashCode = (code: string) =>
  createHash("sha256").update(code).digest("hex");

/** Six digits, zero-padded, from a CSPRNG — never Math.random. */
export function generateCode(): string {
  return `${randomInt(0, 1_000_000)}`.padStart(6, "0");
}

/**
 * Stores the code for an address, replacing any code already outstanding so a
 * resend invalidates the previous one.
 *
 * Returns false when Redis isn't available: without somewhere to put the code
 * there is nothing to verify against later, and pretending otherwise would
 * email a code that can never work.
 */
export async function storeCode(
  email: string,
  code: string,
): Promise<boolean> {
  const redis = getRedis();

  if (!redis) {
    console.error("[auth] Upstash not configured — cannot store a login code.");
    return false;
  }

  const entry: StoredCode = { hash: hashCode(code), attempts: 0 };

  try {
    await redis.set(codeKey(email), entry, { ex: TTL_SECONDS });
    return true;
  } catch (error) {
    console.error("[auth] Failed to store login code:", error);
    return false;
  }
}

export type VerifyResult =
  | { ok: true }
  /** No code outstanding, or it expired / was used / ran out of attempts. */
  | { ok: false; reason: "expired" }
  | { ok: false; reason: "mismatch"; attemptsLeft: number };

/**
 * Checks a submitted code and consumes it on success. A wrong guess burns an
 * attempt; running out discards the code entirely, so an attacker gets five
 * tries per emailed code rather than unlimited ones.
 */
export async function verifyCode(
  email: string,
  code: string,
): Promise<VerifyResult> {
  const redis = getRedis();

  if (!redis) {
    console.error("[auth] Upstash not configured — cannot verify a login code.");
    return { ok: false, reason: "expired" };
  }

  const key = codeKey(email);

  let entry: StoredCode | null;
  try {
    entry = (await redis.get<StoredCode>(key)) ?? null;
  } catch (error) {
    console.error("[auth] Failed to read login code:", error);
    return { ok: false, reason: "expired" };
  }

  if (!entry) {
    return { ok: false, reason: "expired" };
  }

  if (entry.hash === hashCode(code)) {
    // Single use — drop it before returning so a replay can't reuse it.
    try {
      await redis.del(key);
    } catch (error) {
      console.error("[auth] Failed to consume login code:", error);
    }
    return { ok: true };
  }

  const attempts = entry.attempts + 1;

  if (attempts >= MAX_ATTEMPTS) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error("[auth] Failed to discard exhausted login code:", error);
    }
    return { ok: false, reason: "expired" };
  }

  try {
    // keepTtl, not a fresh ex: a wrong guess must not slide the 10-minute
    // window forward, or guessing could be stretched out indefinitely.
    await redis.set(key, { ...entry, attempts }, { keepTtl: true });
  } catch (error) {
    console.error("[auth] Failed to record a failed attempt:", error);
  }

  return {
    ok: false,
    reason: "mismatch",
    attemptsLeft: MAX_ATTEMPTS - attempts,
  };
}
