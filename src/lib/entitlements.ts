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

/**
 * `"trial"` is an admin-granted free trial (1/3/7 days, see
 * `TrialDurationDays` in lib/plans.ts) — it has no price and is never a
 * checkout option, so it lives outside `PlanId` rather than inside `PLANS`.
 */
export type EntitlementPlan = PlanId | "trial";

export interface ProEntitlement {
  email: string;
  plan: EntitlementPlan;
  orderId?: string;
  activatedAt: string;
  expiresAt: string;
  /** Set when an admin ended the plan early. The record is kept either way. */
  revokedAt?: string;
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

export interface ProSummary {
  plan: EntitlementPlan;
  /** Whole days left, floored at 1 while still active. */
  daysLeft: number;
}

/**
 * What the client needs to show Pro state — used by the session endpoint so
 * a trial can render "N days left" instead of a plain Pro badge.
 */
export async function getProSummary(
  email: string | undefined | null,
): Promise<ProSummary | null> {
  const entitlement = await getEntitlement(email);
  if (!entitlement || !isEntitlementActive(entitlement)) {
    return null;
  }

  const daysLeft = Math.max(
    1,
    Math.ceil((Date.parse(entitlement.expiresAt) - Date.now()) / DAY_MS),
  );

  return { plan: entitlement.plan, daysLeft };
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
  plan: EntitlementPlan;
  orderId?: string;
  /** Defaults to the plan's own duration. Required when `plan` is "trial". */
  durationDays?: number;
}): Promise<ProEntitlement> {
  const email = normalizeEmail(input.email);
  const durationDays =
    input.durationDays ??
    (input.plan === "trial" ? undefined : PLANS[input.plan].durationDays);

  if (durationDays === undefined) {
    throw new Error("durationDays is required to grant a trial.");
  }

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

/** Cap on one admin listing — a scan is not a place for unbounded work. */
const MAX_LISTED_ENTITLEMENTS = 500;

/**
 * Every entitlement ever granted, active or lapsed.
 *
 * Deliberately a SCAN rather than a maintained index: there was no index when
 * the first entitlements were written, so an index would start empty and hide
 * every existing customer until each one happened to be re-granted. A scan is
 * always complete and this runs only when an admin opens the console.
 */
export async function listEntitlements(): Promise<ProEntitlement[]> {
  const redis = getRedis();
  if (!redis) {
    return [];
  }

  const keys: string[] = [];
  let cursor = "0";

  try {
    do {
      const [next, batch] = await redis.scan(cursor, {
        match: `${PRO_PREFIX}*`,
        count: 100,
      });
      keys.push(...batch);
      cursor = next;
    } while (cursor !== "0" && keys.length < MAX_LISTED_ENTITLEMENTS);
  } catch (error) {
    console.error("[entitlements] Failed to scan entitlements:", error);
    return [];
  }

  if (keys.length === 0) {
    return [];
  }

  try {
    const found = await redis.mget<(ProEntitlement | null)[]>(
      keys.slice(0, MAX_LISTED_ENTITLEMENTS),
    );

    return found.filter((entry): entry is ProEntitlement => entry !== null);
  } catch (error) {
    console.error("[entitlements] Failed to read entitlements:", error);
    return [];
  }
}

/**
 * End a plan early.
 *
 * Expires the entitlement rather than deleting it: this module keeps lapsed
 * records on purpose so a customer stays visible, and an admin needs to see
 * that a plan was cut short — and when — not find an empty space where it was.
 *
 * Returns null when there was nothing to revoke.
 */
export async function revokePro(email: string): Promise<ProEntitlement | null> {
  const normalized = normalizeEmail(email);
  const existing = await getEntitlement(normalized);

  if (!existing) {
    return null;
  }

  const now = new Date().toISOString();

  // expiresAt is what every Pro check reads, so moving it to now is what
  // actually withdraws access; revokedAt is the audit trail.
  const revoked: ProEntitlement = {
    ...existing,
    expiresAt: now,
    revokedAt: now,
  };

  const redis = getRedis();
  if (!redis) {
    throw new Error("Cannot revoke Pro: Upstash Redis is not configured.");
  }

  try {
    await redis.set(proKey(normalized), revoked);
  } catch (error) {
    console.error("[entitlements] Failed to revoke entitlement:", error);
    throw new Error("Cannot revoke Pro: the change could not be saved.");
  }

  return revoked;
}
