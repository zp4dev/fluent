import { Redis } from "@upstash/redis";

/**
 * Shared Upstash client. Returns null when the env vars aren't configured (e.g.
 * local dev without Redis) so callers can degrade instead of crashing.
 */

let cachedRedis: Redis | null = null;
let initialized = false;

export function getRedis(): Redis | null {
  if (initialized) {
    return cachedRedis;
  }
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  cachedRedis = url && token ? new Redis({ url, token }) : null;
  return cachedRedis;
}
