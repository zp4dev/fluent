/**
 * Bearer-token guard for admin routes.
 *
 * Fails closed: if ADMIN_TOKEN isn't set, every admin request is rejected, so
 * a missing env var can never leave the endpoints wide open.
 */
export function isAuthorizedAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN?.trim();

  if (!expected) {
    console.error("[admin] ADMIN_TOKEN is not set — refusing admin request.");
    return false;
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : "";

  return provided.length > 0 && provided === expected;
}
