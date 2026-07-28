import { NextResponse } from "next/server";

import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { grantPro, revokePro } from "@/lib/entitlements";
import { getOrder, listPendingOrders, markOrderPaid } from "@/lib/orders";
import { isPlanId } from "@/lib/plans";
import { isValidEmail } from "@/lib/validateEmail";

/**
 * Manual reconciliation endpoint.
 *
 * GET  — list pending orders to check against bank transactions.
 * POST — mark an order paid (or grant Pro directly by email) and set the expiry.
 *
 * Guarded by ADMIN_TOKEN; see lib/adminAuth.ts.
 */

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorized();
  }

  const orders = await listPendingOrders();
  return NextResponse.json({ count: orders.length, orders });
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin(request)) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as {
      orderId?: string;
      email?: string;
      plan?: string;
      durationDays?: number;
      revoke?: boolean;
    };

    // Revoke by email (refunds, mistakes).
    if (body.revoke) {
      if (!body.email || !isValidEmail(body.email)) {
        return NextResponse.json(
          { error: "A valid email is required to revoke." },
          { status: 400 },
        );
      }
      await revokePro(body.email);
      return NextResponse.json({ ok: true, revoked: body.email });
    }

    // Path 1: activate an existing pending order.
    if (body.orderId) {
      const order = await getOrder(body.orderId);

      if (!order) {
        return NextResponse.json(
          { error: `Order not found: ${body.orderId}` },
          { status: 404 },
        );
      }

      const entitlement = await grantPro({
        email: order.email,
        plan: order.plan,
        orderId: order.id,
        durationDays: body.durationDays ?? order.durationDays,
      });

      const updated = await markOrderPaid(order.id, {
        activatedAt: entitlement.activatedAt,
        expiresAt: entitlement.expiresAt,
      });

      console.log(
        `[admin] Activated order ${order.id} for ${order.email} until ${entitlement.expiresAt}`,
      );

      return NextResponse.json({ ok: true, order: updated, entitlement });
    }

    // Path 2: grant directly by email, for transfers with no matching order
    // (e.g. someone paid but never clicked "Mình đã chuyển khoản").
    if (body.email && body.plan) {
      if (!isValidEmail(body.email)) {
        return NextResponse.json({ error: "Invalid email." }, { status: 400 });
      }
      if (!isPlanId(body.plan)) {
        return NextResponse.json(
          { error: "Invalid plan — expected 'annual' or 'monthly'." },
          { status: 400 },
        );
      }

      const entitlement = await grantPro({
        email: body.email,
        plan: body.plan,
        durationDays: body.durationDays,
      });

      console.log(
        `[admin] Granted ${body.plan} to ${body.email} until ${entitlement.expiresAt}`,
      );

      return NextResponse.json({ ok: true, entitlement });
    }

    return NextResponse.json(
      { error: "Provide either { orderId } or { email, plan }." },
      { status: 400 },
    );
  } catch (error) {
    console.error("[admin] Activation failed:", error);
    return NextResponse.json({ error: "Activation failed." }, { status: 500 });
  }
}
