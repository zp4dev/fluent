/**
 * Fluent Pro plans.
 *
 * Each plan maps to its own STATIC VietQR image in /public/qr — the QR encodes
 * the exact amount, so QR codes are never generated dynamically.
 *
 * `durationDays` is what Pro is extended by when a transfer is confirmed and
 * the account is activated manually.
 */

export type PlanId = "annual" | "monthly";

export interface Plan {
  id: PlanId;
  name: string;
  amount: number;
  priceLabel: string;
  periodLabel: string;
  /** Shown under the price on the annual plan to make the saving concrete. */
  perMonthLabel?: string;
  badge?: string;
  qrSrc: string;
  durationDays: number;
}

export const PLANS: Record<PlanId, Plan> = {
  annual: {
    id: "annual",
    name: "Pro 1 năm",
    amount: 790_000,
    priceLabel: "790.000đ",
    periodLabel: "/năm",
    perMonthLabel: "≈ 65.800đ mỗi tháng",
    badge: "Tiết kiệm ~33%",
    qrSrc: "/qr/pro-annual.jpg",
    durationDays: 365,
  },
  monthly: {
    id: "monthly",
    name: "Pro 1 tháng",
    amount: 99_000,
    priceLabel: "99.000đ",
    periodLabel: "/tháng",
    qrSrc: "/qr/pro-monthly.jpg",
    durationDays: 30,
  },
};

/** Annual first — it's the default and the best-value option. */
export const PLAN_ORDER: PlanId[] = ["annual", "monthly"];

export const DEFAULT_PLAN_ID: PlanId = "annual";

export function isPlanId(value: unknown): value is PlanId {
  return value === "annual" || value === "monthly";
}

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}
