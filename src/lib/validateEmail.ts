/**
 * Shared by the checkout UI and the orders route, so both agree on what counts
 * as a usable address. Deliberately permissive — this only catches typos; the
 * real check is whether a transfer with this email actually arrives.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** Emails are the identity key, so they must be compared consistently. */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
