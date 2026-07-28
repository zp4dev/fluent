/**
 * Shared identifiers for the Pro fair-use daily cap.
 *
 * Kept free of Redis / Upstash imports so client components can distinguish a
 * Pro-daily 429 from the IP hourly limiter without pulling server code.
 */

export const PRO_DAILY_LIMIT_CODE = "PRO_DAILY_LIMIT";

/** Friendly copy when the quiet fair-use cap is hit. Does not name the number. */
export const PRO_DAILY_LIMIT_MESSAGE =
  "Hôm nay bạn đã tạo đủ bài học rồi. Ngày mai quay lại tiếp nhé — mình sẽ sẵn sàng! ☕";
