import { NextResponse } from "next/server";

import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { listPendingOrders } from "@/lib/orders";

/**
 * Read-only list of unreconciled orders, newest first.
 *
 * Exists for recovery: when a transfer note has a typo'd or missing email,
 * /api/admin/activate can't match it, so you list what's pending and find the
 * order by amount and timestamp instead. Activation still goes through
 * /api/admin/activate — there is deliberately no mutating verb here.
 *
 * The secret must come from the Authorization header; GET has no body and
 * putting it in the query string would leak it into access logs.
 *
 *   curl -H "Authorization: Bearer $ADMIN_SECRET" \
 *     https://your-app/api/admin/orders
 */
export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await listPendingOrders();

    return NextResponse.json({
      count: orders.length,
      orders: orders.map((order) => ({
        id: order.id,
        email: order.email,
        plan: order.plan,
        planName: order.planName,
        amount: order.amount,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("[admin] Failed to list pending orders:", error);
    return NextResponse.json(
      { error: "Could not list pending orders." },
      { status: 500 },
    );
  }
}
