/**
 * Fluent Pro plans.
 *
 * `name` stays Vietnamese: it is copied into the order record that is
 * reconciled by hand, so it must not vary with the buyer's UI language. The
 * user-facing plan copy is translated in the checkout component instead.
 *
 * The VietQR image for each plan is built at render time from `amount` (see
 * `@/lib/vietqr`), so there's no static QR asset to keep in sync per plan.
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
  /**
   * Shown under the price on the annual plan to make the saving concrete. Kept
   * as a number, not a label: the surrounding sentence ("≈ {amount} per month")
   * is translated, only the amount is fixed.
   */
  perMonthAmount?: number;
  durationDays: number;
}

export const PLANS: Record<PlanId, Plan> = {
  annual: {
    id: "annual",
    name: "Pro 1 năm",
    amount: 790_000,
    priceLabel: "790.000đ",
    perMonthAmount: 65_800,
    durationDays: 365,
  },
  monthly: {
    id: "monthly",
    name: "Pro 1 tháng",
    amount: 99_000,
    priceLabel: "99.000đ",
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
