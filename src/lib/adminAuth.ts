import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Shared-secret guard for admin routes.
 *
 * This is the only thing between the public and free Pro, so it fails closed:
 * if ADMIN_SECRET isn't set, every admin request is rejected rather than
 * silently allowed.
 *
 * The secret may arrive as an `Authorization: Bearer <secret>` header or as a
 * `secret` field in the JSON body, whichever is easier to send.
 */

/**
 * Constant-time compare so a wrong secret can't be narrowed down by timing.
 *
 * Both sides are hashed first so the comparison always runs over 32 bytes:
 * `timingSafeEqual` throws on length mismatch, and comparing raw strings would
 * leak the secret's length through that early exit.
 */
function safeEqual(a: string, b: string): boolean {
  const digest = (value: string) =>
    createHash("sha256").update(value, "utf8").digest();

  return timingSafeEqual(digest(a), digest(b));
}

export function isAuthorizedAdmin(
  request: Request,
  bodySecret?: string,
): boolean {
  const expected = process.env.ADMIN_SECRET?.trim();

  if (!expected) {
    console.error("[admin] ADMIN_SECRET is not set — refusing admin request.");
    return false;
  }

  const header = request.headers.get("authorization") ?? "";
  const headerSecret = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : "";

  const provided = headerSecret || bodySecret?.trim() || "";

  return provided.length > 0 && safeEqual(provided, expected);
}
