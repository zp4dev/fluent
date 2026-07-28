import { PLANS, type PlanId } from "@/lib/plans";
import { getRedis } from "@/lib/redis";
import { normalizeEmail } from "@/lib/validateEmail";

/**
 * Upgrade orders.
 *
 * An order records that someone says they've paid. It does NOT grant Pro —
 * that happens when the transfer is confirmed by hand and the order is marked
 * paid, which writes the actual entitlement (see lib/entitlements.ts).
 *
 * Stored in Upstash Redis. If Redis isn't configured, orders are logged instead
 * so intent is never silently lost.
 */

const ORDER_PREFIX = "fluent-order:";
const PENDING_LIST = "fluent-orders:pending";
const MAX_LISTED = 100;

export type OrderStatus = "pending" | "paid";

export interface Order {
  id: string;
  /** Email doubles as the user id until real accounts exist. */
  userId: string;
  email: string;
  plan: PlanId;
  planName: string;
  amount: number;
  durationDays: number;
  status: OrderStatus;
  createdAt: string;
  /** Set when the transfer is confirmed and Pro is granted. */
  activatedAt?: string;
  expiresAt?: string;
}

const orderKey = (id: string) => `${ORDER_PREFIX}${id}`;

export async function createPendingOrder(input: {
  email: string;
  plan: PlanId;
}): Promise<Order> {
  const email = normalizeEmail(input.email);
  const plan = PLANS[input.plan];

  const order: Order = {
    id: crypto.randomUUID(),
    userId: email,
    email,
    plan: plan.id,
    planName: plan.name,
    amount: plan.amount,
    durationDays: plan.durationDays,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const redis = getRedis();

  if (!redis) {
    console.warn(
      "[orders] Upstash env vars not set — order not persisted. Record it manually:",
      JSON.stringify(order),
    );
    return order;
  }

  try {
    await redis.set(orderKey(order.id), order);
    await redis.lpush(PENDING_LIST, order.id);
  } catch (error) {
    // Don't fail the request — the buyer may have already sent money. Log the
    // full record so it can still be reconciled from the logs.
    console.error(
      "[orders] Failed to persist order:",
      JSON.stringify(order),
      error,
    );
  }

  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  try {
    return (await redis.get<Order>(orderKey(id))) ?? null;
  } catch (error) {
    console.error("[orders] Failed to read order:", id, error);
    return null;
  }
}

/** Newest first — what you reconcile bank transfers against. */
export async function listPendingOrders(): Promise<Order[]> {
  const redis = getRedis();
  if (!redis) {
    return [];
  }

  try {
    const ids = await redis.lrange(PENDING_LIST, 0, MAX_LISTED - 1);
    if (ids.length === 0) {
      return [];
    }

    const orders = await Promise.all(ids.map((id) => getOrder(id)));
    return orders.filter((order): order is Order => order !== null);
  } catch (error) {
    console.error("[orders] Failed to list pending orders:", error);
    return [];
  }
}

/**
 * The newest still-pending order for an email — what a confirmed bank transfer
 * gets matched against.
 *
 * Scans the pending list rather than keeping a per-email index: the list only
 * holds unreconciled orders (ids are removed on activation), so it stays small.
 */
export async function findLatestPendingOrderByEmail(
  email: string,
): Promise<Order | null> {
  const target = normalizeEmail(email);
  const pending = await listPendingOrders();

  const matches = pending
    .filter((order) => order.status === "pending" && order.email === target)
    .sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

  return matches[0] ?? null;
}

/**
 * Mark an order paid. Returns the updated order, or null if it doesn't exist.
 * The caller is responsible for granting the entitlement.
 */
export async function markOrderPaid(
  id: string,
  activation: { activatedAt: string; expiresAt: string },
): Promise<Order | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  const order = await getOrder(id);
  if (!order) {
    return null;
  }

  const updated: Order = {
    ...order,
    status: "paid",
    activatedAt: activation.activatedAt,
    expiresAt: activation.expiresAt,
  };

  try {
    await redis.set(orderKey(id), updated);
    await redis.lrem(PENDING_LIST, 0, id);
  } catch (error) {
    console.error("[orders] Failed to mark order paid:", id, error);
    return null;
  }

  return updated;
}
