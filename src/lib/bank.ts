/**
 * Bank details shown as plain text under the QR, for anyone who can't scan it.
 *
 * NEXT_PUBLIC_* values are inlined at build time, so they must be referenced
 * statically here — a dynamic process.env[name] lookup would come back empty in
 * the browser.
 */

export const BANK_DETAILS = {
  bankName: process.env.NEXT_PUBLIC_BANK_NAME || "Vietcombank",
  /** Vietcombank's VietQR/Napas BIN — used to build the VietQR image URL. */
  bankId: process.env.NEXT_PUBLIC_BANK_ID || "970436",
  accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT || "1039760814",
  accountHolder: process.env.NEXT_PUBLIC_BANK_HOLDER || "DANG QUANG DANH",
  branch: process.env.NEXT_PUBLIC_BANK_BRANCH || "",
} as const;
