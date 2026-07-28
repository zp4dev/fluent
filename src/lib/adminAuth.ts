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

/** Constant-time compare so a wrong secret can't be narrowed down by timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
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
