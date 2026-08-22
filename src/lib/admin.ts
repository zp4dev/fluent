import { readSession, type Session } from "@/lib/authSession";
import { normalizeEmail } from "@/lib/validateEmail";

/**
 * Who counts as an admin.
 *
 * The allowlist is the ONLY thing that separates an admin from any other
 * verified address, so it is checked server-side on every admin surface — the
 * /admin page and the admin API routes alike. Nothing here may be trusted from
 * the client: a session proves which address you control, this decides whether
 * that address is allowed to reconcile payments and grant Pro.
 */

const DEFAULT_ADMIN_EMAILS = ["zp4dev@gmail.com", "jackdvng@gmail.com"];

/**
 * ADMIN_EMAILS (comma-separated) overrides the built-in pair, so a maintainer
 * can be added or removed without a code change. An empty/unset value keeps
 * the defaults rather than locking everyone out.
 */
export function getAdminEmails(): string[] {
  const configured = process.env.ADMIN_EMAILS?.trim();

  if (!configured) {
    return DEFAULT_ADMIN_EMAILS;
  }

  const parsed = configured
    .split(",")
    .map((entry) => normalizeEmail(entry))
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_ADMIN_EMAILS;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmails().includes(normalizeEmail(email));
}

/**
 * The current session, but only when it belongs to an admin.
 *
 * Returns null both for "not signed in" and "signed in as someone else" — the
 * caller decides what each means (the page shows a login form for the first
 * and redirects for the second; API routes reject both identically).
 */
export async function readAdminSession(): Promise<Session | null> {
  const session = await readSession();

  return session && isAdminEmail(session.email) ? session : null;
}
