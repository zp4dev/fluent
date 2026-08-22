import {
  isEntitlementActive,
  listEntitlements,
  type ProEntitlement,
} from "@/lib/entitlements";
import type { PlanId } from "@/lib/plans";
import { getRedis } from "@/lib/redis";
import { normalizeEmail } from "@/lib/validateEmail";

/**
 * Per-user facts the admin console shows, none of which existed before it did.
 *
 * IMPORTANT: both counters below start from the moment this shipped. Lessons
 * generated earlier were never counted, and logins before this were never
 * recorded, so existing customers legitimately read 0 lessons and "never" for
 * their last login until they next use the app. There is no back-fill because
 * there is no historical data to back-fill from.
 */

const LESSONS_PREFIX = "fluent-user-lessons:";
const LOGIN_PREFIX = "fluent-user-login:";
const DAY_MS = 24 * 60 * 60 * 1000;

export interface LastLogin {
  ip: string;
  /** ISO timestamp. */
  at: string;
}

export interface AdminUser {
  email: string;
  plan: PlanId;
  activatedAt: string;
  expiresAt: string;
  isActive: boolean;
  /** Whole days of Pro left; 0 once lapsed or revoked. */
  daysLeft: number;
  lessonCount: number;
  lastLogin: LastLogin | null;
  revokedAt?: string;
}

const lessonsKey = (email: string) => `${LESSONS_PREFIX}${normalizeEmail(email)}`;
const loginKey = (email: string) => `${LOGIN_PREFIX}${normalizeEmail(email)}`;

/**
 * Records where someone logged in from. Called after an OTP is accepted —
 * the only moment a browser proves which address it controls.
 *
 * Never throws: failing to write an audit line must not break a login that
 * has otherwise succeeded.
 */
export async function recordLogin(email: string, ip: string): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  const entry: LastLogin = { ip, at: new Date().toISOString() };

  try {
    await redis.set(loginKey(email), entry);
  } catch (error) {
    console.error("[user-admin] Failed to record login:", error);
  }
}

/**
 * Counts one generated lesson against an address. Only signed-in users have
 * one, so anonymous free-tier generations are not counted — there is nobody
 * to attribute them to.
 *
 * Never throws: a bookkeeping failure must not fail a lesson the user has
 * already waited 30 seconds for and which we have already paid Claude for.
 */
export async function countLessonGenerated(
  email: string | undefined | null,
): Promise<void> {
  if (!email) {
    return;
  }

  const redis = getRedis();
  if (!redis) {
    return;
  }

  try {
    await redis.incr(lessonsKey(email));
  } catch (error) {
    console.error("[user-admin] Failed to count a lesson:", error);
  }
}

function daysLeft(entitlement: ProEntitlement, now: Date): number {
  const expires = Date.parse(entitlement.expiresAt);

  if (!Number.isFinite(expires) || expires <= now.getTime()) {
    return 0;
  }

  return Math.ceil((expires - now.getTime()) / DAY_MS);
}

/**
 * Everyone who has ever held Pro, newest activation first, joined to their
 * lesson count and last login.
 *
 * The two extra reads are batched into single MGETs rather than a pair of
 * round trips per user, so opening the console costs three Redis calls in
 * total however many customers there are.
 */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const entitlements = await listEntitlements();

  if (entitlements.length === 0) {
    return [];
  }

  const redis = getRedis();
  const now = new Date();

  let lessonCounts: (number | string | null)[] = [];
  let logins: (LastLogin | null)[] = [];

  if (redis) {
    try {
      [lessonCounts, logins] = await Promise.all([
        redis.mget<(number | string | null)[]>(
          entitlements.map((entry) => lessonsKey(entry.email)),
        ),
        redis.mget<(LastLogin | null)[]>(
          entitlements.map((entry) => loginKey(entry.email)),
        ),
      ]);
    } catch (error) {
      // A missing sidecar must not hide the customer list itself.
      console.error("[user-admin] Failed to read user activity:", error);
    }
  }

  return entitlements
    .map((entitlement, index) => {
      const raw = lessonCounts[index];
      const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : raw;

      return {
        email: entitlement.email,
        plan: entitlement.plan,
        activatedAt: entitlement.activatedAt,
        expiresAt: entitlement.expiresAt,
        isActive: isEntitlementActive(entitlement, now),
        daysLeft: daysLeft(entitlement, now),
        lessonCount: typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0,
        lastLogin: logins[index] ?? null,
        revokedAt: entitlement.revokedAt,
      } satisfies AdminUser;
    })
    .sort((a, b) => Date.parse(b.activatedAt) - Date.parse(a.activatedAt));
}
