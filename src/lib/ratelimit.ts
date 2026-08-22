import { Ratelimit } from "@upstash/ratelimit";

import { getRedis } from "@/lib/redis";

/**
 * Rate limiting for the public API routes, built on Upstash.
 *
 * Every limiter here fails OPEN: if Upstash isn't configured (local dev) or is
 * unreachable, requests are allowed rather than letting a Redis outage take
 * the whole feature down.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

interface LimiterConfig {
  /**
   * Redis key prefix. Changing it resets every counter currently in flight,
   * so existing prefixes must stay stable.
   */
  prefix: string;
  /** Requests per window — also what the fail-open result reports. */
  limit: number;
  limiter: ConstructorParameters<typeof Ratelimit>[0]["limiter"];
  /** Log tag, e.g. "ratelimit". */
  label: string;
}

/**
 * Builds the check function for one limiter. The Ratelimit instance is created
 * on first use and then reused, so importing this module never touches Redis.
 */
export function createRateLimiter(
  config: LimiterConfig,
): (identifier: string) => Promise<RateLimitResult> {
  let cached: Ratelimit | null = null;
  let initialized = false;

  function getLimiter(): Ratelimit | null {
    if (initialized) {
      return cached;
    }
    initialized = true;

    const redis = getRedis();

    if (!redis) {
      console.warn(
        `[${config.label}] Upstash env vars not set — limiting is disabled.`,
      );
      cached = null;
      return null;
    }

    cached = new Ratelimit({
      redis,
      limiter: config.limiter,
      prefix: config.prefix,
      analytics: false,
    });

    return cached;
  }

  const allowed = (): RateLimitResult => ({
    success: true,
    limit: config.limit,
    remaining: config.limit,
    reset: 0,
  });

  return async function check(identifier: string): Promise<RateLimitResult> {
    const limiter = getLimiter();

    if (!limiter) {
      return allowed();
    }

    try {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.error(`[${config.label}] Limiter error — failing open:`, error);
      return allowed();
    }
  };
}

/**
 * Extract the client IP from request headers. On Vercel the real client IP is
 * the first entry of `x-forwarded-for`.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

/** Lesson generation: the expensive path, so the tightest cap. */
export const checkRateLimit = createRateLimiter({
  prefix: "fluent-ratelimit",
  limit: 5,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  label: "ratelimit",
});

/**
 * Pro-status lookups. A real visitor checks their own address a handful of
 * times; scanning for other people's addresses needs thousands.
 */
export const checkProStatusLimit = createRateLimiter({
  prefix: "fluent-pro-status",
  limit: 20,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  label: "pro-status-limit",
});

/**
 * Upgrade orders. Keeps the pending list — which admin reconciliation reads —
 * from being flooded with junk.
 */
export const checkOrderLimit = createRateLimiter({
  prefix: "fluent-orders",
  limit: 5,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  label: "orders-limit",
});

/** Login codes, per IP: caps how fast one client can spray requests. */
export const checkSendCodeIpLimit = createRateLimiter({
  prefix: "fluent-auth-send-ip",
  limit: 5,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  label: "auth-send-ip",
});

/**
 * Login codes, per address. Separate from the IP limit because the abuse it
 * stops is different: mail-bombing one victim from many addresses.
 */
export const checkSendCodeEmailLimit = createRateLimiter({
  prefix: "fluent-auth-send-email",
  limit: 3,
  limiter: Ratelimit.slidingWindow(3, "1 h"),
  label: "auth-send-email",
});

/**
 * Code submissions. The five-attempt cap per code lives in
 * lib/verificationCode.ts; this stops an attacker requesting code after code
 * to buy more attempts.
 */
export const checkVerifyCodeLimit = createRateLimiter({
  prefix: "fluent-auth-verify",
  limit: 10,
  limiter: Ratelimit.slidingWindow(10, "1 h"),
  label: "auth-verify",
});
