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
const PENDING_BY_EMAIL_PREFIX = "fluent-order-pending:";
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

/**
 * Points at a buyer's newest unreconciled order.
 *
 * Kept separate from PENDING_LIST because that list is capped at MAX_LISTED
 * for reconciliation — a real order must never fall outside the lookup just
 * because the queue got long.
 */
const pendingKey = (email: string) => `${PENDING_BY_EMAIL_PREFIX}${email}`;

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
    await redis.set(pendingKey(email), order.id);
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

    // One MGET rather than one GET per id — this runs on every admin
    // reconciliation and the list can hold up to MAX_LISTED entries.
    const orders = await redis.mget<(Order | null)[]>(ids.map(orderKey));
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
 * A single GET through the per-email pointer. This used to scan PENDING_LIST,
 * which silently missed real orders once the queue passed MAX_LISTED entries.
 */
export async function findLatestPendingOrderByEmail(
  email: string,
): Promise<Order | null> {
  const target = normalizeEmail(email);

  const redis = getRedis();
  if (!redis) {
    return null;
  }

  let id: string | null;

  try {
    id = await redis.get<string>(pendingKey(target));
  } catch (error) {
    console.error("[orders] Failed to read pending pointer:", target, error);
    return null;
  }

  if (!id) {
    return null;
  }

  const order = await getOrder(id);

  // The pointer can outlive what it points at, so re-check the order itself
  // rather than trusting it.
  if (!order || order.status !== "pending" || order.email !== target) {
    return null;
  }

  return order;
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
    // Clears the lookup so the same transfer can't be activated twice.
    await redis.del(pendingKey(order.email));
  } catch (error) {
    console.error("[orders] Failed to mark order paid:", id, error);
    return null;
  }

  return updated;
}
