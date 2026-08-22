import { getRedis } from "@/lib/redis";
import { normalizeEmail } from "@/lib/validateEmail";

/**
 * Serializes manual activation per email.
 *
 * Activation reads the pending order, grants Pro, then marks the order paid.
 * Two overlapping calls for the same buyer would both see the same pending
 * order and grant twice, stacking a second period onto the entitlement — so
 * the second caller is turned away rather than queued.
 *
 * The TTL is a safety valve: if a request dies between acquire and release,
 * the lock frees itself instead of blocking that buyer forever.
 */

const LOCK_PREFIX = "fluent-activate-lock:";
const LOCK_TTL_SECONDS = 30;

export interface ActivationLock {
  release: () => Promise<void>;
}

/**
 * Returns a lock handle, or null when another activation for this email is
 * already in flight. Without Redis there is nothing to serialize against, so
 * the caller proceeds unlocked — same degrade-instead-of-crash stance as the
 * rest of the Redis-backed code.
 */
export async function acquireActivationLock(
  email: string,
): Promise<ActivationLock | null> {
  const redis = getRedis();
  if (!redis) {
    return { release: async () => {} };
  }

  const key = `${LOCK_PREFIX}${normalizeEmail(email)}`;

  try {
    const acquired = await redis.set(key, "1", {
      nx: true,
      ex: LOCK_TTL_SECONDS,
    });

    if (acquired !== "OK") {
      return null;
    }

    return {
      release: async () => {
        try {
          await redis.del(key);
        } catch (error) {
          // The TTL will clear it; a failed release must not mask a successful
          // activation.
          console.error("[activation-lock] Failed to release:", key, error);
        }
      },
    };
  } catch (error) {
    // A locking outage shouldn't block a confirmed transfer from being
    // activated — fall through unlocked, same as the no-Redis case.
    console.error("[activation-lock] Failed to acquire:", key, error);
    return { release: async () => {} };
  }
}
