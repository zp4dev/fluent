import { NextResponse } from "next/server";

import { createPendingOrder } from "@/lib/orders";
import { isPlanId } from "@/lib/plans";
import { isValidEmail } from "@/lib/validateEmail";

/**
 * Records an intent to upgrade. This does NOT confirm or verify payment —
 * activation happens manually after the bank transfer is checked.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      plan?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const plan = body.plan;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Email chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé." },
        { status: 400 },
      );
    }

    if (!isPlanId(plan)) {
      return NextResponse.json(
        { ok: false, error: "Gói nâng cấp không hợp lệ." },
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
        error: "Không ghi nhận được yêu cầu. Bạn thử lại giúp mình nhé.",
      },
      { status: 500 },
    );
  }
}
