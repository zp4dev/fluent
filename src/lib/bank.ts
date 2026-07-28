/**
 * Bank details shown as plain text under the QR, for anyone who can't scan it.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so they must be referenced
 * statically here — a dynamic process.env[name] lookup would come back empty in
 * the browser.
 */

export const BANK_DETAILS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "Vietcombank",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "",
  accountHolder: process.env.NEXT_PUBLIC_BANK_HOLDER || "DANG QUANG DANH",
  branch: process.env.NEXT_PUBLIC_BANK_BRANCH || "",
} as const;
