import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import {
  PRO_DAILY_LIMIT_CODE,
  PRO_DAILY_LIMIT_MESSAGE,
} from "@/lib/proDailyLimitShared";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

export { PRO_DAILY_LIMIT_CODE, PRO_DAILY_LIMIT_MESSAGE };

/**
 * Quiet fair-use cap for Pro lesson generation: 10 lessons per calendar day.
 *
 * Applies to every Pro path — paid entitlements and grandfathered license keys.
 * Keyed by the buyer's email when available; falls back to the license key so
 * lifetime users without a stored email are still capped.
 *
 * Uses the same Upstash Ratelimit fixed-window pattern as the IP hourly limiter.
 * A "1 d" window resets on UTC day boundaries (consistent server-side clock),
 * matching the free tier's "resets tomorrow" feel.
 */

export const PRO_DAILY_LIMIT = 10;
const WINDOW = "1 d" as const;

let cachedLimiter: Ratelimit | null = null;
let initialized = false;

function getLimiter(): Ratelimit | null {
  if (initialized) {
    return cachedLimiter;
  }
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "[pro-daily] Upstash env vars not set — Pro daily limit is disabled.",
    );
    cachedLimiter = null;
    return null;
  }

  cachedLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.fixedWindow(PRO_DAILY_LIMIT, WINDOW),
    prefix: "fluent-pro-daily",
    analytics: false,
  });

  return cachedLimiter;
}

/**
 * Stable identity for the daily counter. Prefer the checkout email seam; use
 * the license key for grandfathered users who never entered one.
 */
export function getProDailyIdentifier(input: {
  email?: string | null;
  licenseKey?: string | null;
}): string | null {
  const email = input.email?.trim();
  if (email && isValidEmail(email)) {
    return `email:${normalizeEmail(email)}`;
  }

  const key = input.licenseKey?.trim();
  if (key) {
    return `license:${key}`;
  }

  return null;
}

export interface ProDailyLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
}

/**
 * Check (and consume) one Pro generation for the day. Fail-open if Redis isn't
 * configured — same stance as the IP rate limiter.
 */
export async function checkProDailyLimit(
  identifier: string,
): Promise<ProDailyLimitResult> {
  const limiter = getLimiter();

  if (!limiter) {
    return {
      success: true,
      limit: PRO_DAILY_LIMIT,
      remaining: PRO_DAILY_LIMIT,
    };
  }

  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
    };
  } catch (error) {
    console.error("[pro-daily] Limiter error — failing open:", error);
    return {
      success: true,
      limit: PRO_DAILY_LIMIT,
      remaining: PRO_DAILY_LIMIT,
    };
  }
}
