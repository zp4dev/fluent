import { createHash, timingSafeEqual } from "node:crypto";

import { readAdminSession } from "@/lib/admin";

/**
 * Guard for admin routes. Two ways in, both proven server-side:
 *
 *  1. A verified session whose address is on the admin allowlist — this is
 *     what the /admin UI in the browser uses. The session cookie is
 *     SameSite=Lax, so it is not sent on a cross-site POST; that is what
 *     stands in for a CSRF token on the mutating routes.
 *  2. The shared secret, as `Authorization: Bearer <secret>` or a `secret`
 *     field in the JSON body — this keeps the existing curl workflow working.
 *
 * The secret path fails closed: if ADMIN_SECRET isn't set, it rejects rather
 * than silently allowing. A missing secret must never turn into open access.
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

export async function isAuthorizedAdmin(
  request: Request,
  bodySecret?: string,
): Promise<boolean> {
  // Signed in through /admin as an allowlisted address.
  if (await readAdminSession()) {
    return true;
  }

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
