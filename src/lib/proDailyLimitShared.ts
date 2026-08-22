/**
 * Shared identifiers for the Pro fair-use daily cap.
 *
 * Kept free of Redis / Upstash imports so client components can distinguish a
 * Pro-daily 429 from the IP hourly limiter without pulling server code.
 *
 * The message itself now lives in the dictionaries (`api.proDailyLimit`) so it
 * arrives in the reader's language; only the machine-readable code is fixed.
 */

export const PRO_DAILY_LIMIT_CODE = "PRO_DAILY_LIMIT";
