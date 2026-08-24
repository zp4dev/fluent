/**
 * Builds a VietQR quick-link image URL — img.vietqr.io renders the QR PNG on
 * the fly from the bank/account/amount in the query string, so we no longer
 * need a pre-baked static PNG per plan.
 *
 * https://www.vietqr.io/danh-sach-api/link-tao-ma-qr/
 */

interface VietQrParams {
  bankId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  addInfo?: string;
}

export function buildVietQrUrl({
  bankId,
  accountNumber,
  accountName,
  amount,
  addInfo,
}: VietQrParams): string {
  const params = new URLSearchParams({
    amount: String(amount),
    accountName,
  });

  if (addInfo) {
    params.set("addInfo", addInfo);
  }

  // "qr_only" returns the bare QR code with no bank-info card baked into the
  // image — the bank details are already rendered as text below it.
  return `https://img.vietqr.io/image/${bankId}-${accountNumber}-qr_only.png?${params.toString()}`;
}
