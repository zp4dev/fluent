import { Ratelimit } from "@upstash/ratelimit";

import { PDF_LIMIT, PDF_LIMIT_CODE } from "@/lib/pdfLimitShared";
import { createRateLimiter } from "@/lib/ratelimit";

export { PDF_LIMIT, PDF_LIMIT_CODE };

/**
 * Fair-use cap on PDF exports: 3 per rolling hour, Pro only.
 *
 * Unlike the lesson-generation limiters, this isn't protecting a paid API
 * call — the PDF is rendered client-side from a lesson the browser already
 * has, so a generation costs the server nothing. It exists so the export
 * button can't be scripted into a bulk content dump. Keyed the same way as
 * the Pro daily lesson cap (see getProDailyIdentifier), so both quotas
 * answer "who is this" identically.
 */
export const checkPdfLimit = createRateLimiter({
  prefix: "fluent-pdf",
  limit: PDF_LIMIT,
  limiter: Ratelimit.slidingWindow(PDF_LIMIT, "1 h"),
  label: "pdf-limit",
});
