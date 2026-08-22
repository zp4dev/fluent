/**
 * Shared identifier for the PDF export quota.
 *
 * Kept free of Redis / Upstash imports so the client component can recognise
 * a quota 429 without pulling server code into its bundle — same reasoning as
 * proDailyLimitShared.ts.
 */

export const PDF_LIMIT_CODE = "PDF_LIMIT";

/** Exports per rolling hour, Pro only. */
export const PDF_LIMIT = 3;
