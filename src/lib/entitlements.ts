import { PLANS, type PlanId } from "@/lib/plans";
import { getRedis } from "@/lib/redis";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

/**
 * Pro entitlements granted by manual activation (bank transfer).
 *
 * Keyed by email so a Pro check is a single Redis GET rather than a scan over
 * orders. This runs in parallel with the older Lemon Squeezy license-key path —
 * see lib/pro.ts, which passes if either says Pro.
 *
 * Entitlements are kept after they lapse (no Redis TTL) so expired customers
 * are still visible; `expiresAt` is the authoritative check.
 */

const PRO_PREFIX = "fluent-pro:";
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ProEntitlement {
  email: string;
  plan: PlanId;
  orderId?: string;
  activatedAt: string;
  expiresAt: string;
}

const proKey = (email: string) => `${PRO_PREFIX}${normalizeEmail(email)}`;

export async function getEntitlement(
  email: string | undefined | null,
): Promise<ProEntitlement | null> {
  const normalized = email ? normalizeEmail(email) : "";
  if (!normalized || !isValidEmail(normalized)) {
    return null;
  }

  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    return (await redis.get<ProEntitlement>(proKey(normalized))) ?? null;
  } catch (error) {
    console.error("[entitlements] Redis read failed:", error);
    return null;
  }
}

export function isEntitlementActive(
  entitlement: ProEntitlement | null,
  now: Date = new Date(),
): boolean {
  if (!entitlement?.expiresAt) {
    return false;
  }
  const expires = Date.parse(entitlement.expiresAt);
  return Number.isFinite(expires) && expires > now.getTime();
}

/** True when this email has a paid, non-expired entitlement. */
export async function isProByEmail(
  email: string | undefined | null,
): Promise<boolean> {
  return isEntitlementActive(await getEntitlement(email));
}

/**
 * Grant or extend Pro for an email.
 *
 * Renewals stack: if the current entitlement hasn't lapsed yet, the new period
 * is added on top of the remaining time rather than truncating it.
 *
 * THROWS if the entitlement can't actually be persisted. Money has already
 * changed hands by the time this runs, so a silent no-op would leave the admin
 * believing a buyer has Pro when they have nothing.
 */
export async function grantPro(input: {
  email: string;
  plan: PlanId;
  orderId?: string;
  /** Defaults to the plan's own duration. */
  durationDays?: number;
}): Promise<ProEntitlement> {
  const email = normalizeEmail(input.email);
  const durationDays = input.durationDays ?? PLANS[input.plan].durationDays;

  const now = new Date();
  const existing = await getEntitlement(email);

  const startsFrom =
    existing && isEntitlementActive(existing, now)
      ? new Date(existing.expiresAt)
      : now;

  const entitlement: ProEntitlement = {
    email,
    plan: input.plan,
    orderId: input.orderId,
    activatedAt: now.toISOString(),
    expiresAt: new Date(startsFrom.getTime() + durationDays * DAY_MS).toISOString(),
  };

  const redis = getRedis();

  if (!redis) {
    console.error(
      "[entitlements] Upstash env vars not set — entitlement NOT saved:",
      JSON.stringify(entitlement),
    );
    throw new Error("Cannot grant Pro: Upstash Redis is not configured.");
  }

  try {
    await redis.set(proKey(email), entitlement);
  } catch (error) {
    console.error(
      "[entitlements] Failed to save entitlement:",
      JSON.stringify(entitlement),
      error,
    );
    throw new Error("Cannot grant Pro: the entitlement could not be saved.");
  }

  return entitlement;
}