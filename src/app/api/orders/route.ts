import { NextResponse } from "next/server";

import { readSession } from "@/lib/authSession";
import { getServerDictionary } from "@/lib/i18n/server";
import { createPendingOrder } from "@/lib/orders";
import { isPlanId } from "@/lib/plans";
import { checkOrderLimit, getClientIp } from "@/lib/ratelimit";
import { isValidEmail } from "@/lib/validateEmail";

/**
 * Records an intent to upgrade. This does NOT confirm or verify payment —
 * activation happens manually after the bank transfer is checked.
 *
 * Requires a verified session, and takes the address from it. Reconciliation
 * matches a transfer note against the order's email by hand, so an address
 * nobody has proven they can read is a support ticket waiting to happen.
 */
export async function POST(request: Request) {
  const t = await getServerDictionary();

  try {
    // Unmetered, this endpoint lets anyone flood the pending list that admin
    // reconciliation reads.
    const rateLimit = await checkOrderLimit(getClientIp(request));

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          ok: false,
          error: t.orders.tooManyRequests,
        },
        { status: 429 },
      );
    }

    const session = await readSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, error: t.orders.verifyFirst },
        { status: 401 },
      );
    }

    const email = session.email;
    const body = (await request.json()) as { plan?: string };
    const plan = body.plan;

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: t.auth.invalidEmail },
        { status: 400 },
      );
    }

    if (!isPlanId(plan)) {
      return NextResponse.json(
        { ok: false, error: t.orders.invalidPlan },
        { status: 400 },
      );
    }

    const order = await createPendingOrder({ email, plan });
    console.log(
      `[orders] Pending order ${order.id} — ${order.email} — ${order.planName} — ${order.amount}`,
    );

    return NextResponse.json({ ok: true, orderId: order.id });
  } catch (error) {
    console.error("[orders] Failed to create pending order:", error);
    return NextResponse.json(
      {
        ok: false,
        error: t.checkout.errorNotRecordedRetry,
      },
      { status: 500 },
    );
  }
}
