import { Ratelimit } from "@upstash/ratelimit";

import {
  PRO_DAILY_LIMIT_CODE,
} from "@/lib/proDailyLimitShared";
import { createRateLimiter } from "@/lib/ratelimit";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

export { PRO_DAILY_LIMIT_CODE };

/**
 * Quiet fair-use cap for Pro lesson generation: 10 lessons per calendar day.
 *
 * Applies to every Pro path — paid entitlements and grandfathered license keys.
 * Keyed by the buyer's email when available; falls back to the license key so
 * lifetime users without a stored email are still capped.
 *
 * A "1 d" window resets on UTC day boundaries (consistent server-side clock),
 * matching the free tier's "resets tomorrow" feel.
 */

export const PRO_DAILY_LIMIT = 10;

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

/** Check (and consume) one Pro generation for the day. */
export const checkProDailyLimit = createRateLimiter({
  prefix: "fluent-pro-daily",
  limit: PRO_DAILY_LIMIT,
  limiter: Ratelimit.fixedWindow(PRO_DAILY_LIMIT, "1 d"),
  label: "pro-daily",
});
