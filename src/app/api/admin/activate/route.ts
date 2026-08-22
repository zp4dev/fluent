import { NextResponse } from "next/server";

import { acquireActivationLock } from "@/lib/activationLock";
import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { getEntitlement, grantPro, isEntitlementActive } from "@/lib/entitlements";
import { findLatestPendingOrderByEmail, markOrderPaid } from "@/lib/orders";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

/**
 * Manual activation — the step that actually makes a buyer Pro.
 *
 * Once a bank transfer is confirmed, this flips that buyer's most recent
 * pending order to 'paid' and grants Pro for the order's own durationDays
 * (30 or 365). There's no auto-confirmation anywhere; this is it.
 *
 *   curl -X POST https://your-app/api/admin/activate \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"ban@email.com","secret":"$ADMIN_SECRET"}'
 */
export async function POST(request: Request) {
  let body: { email?: string; secret?: string };

  try {
    body = (await request.json()) as { email?: string; secret?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!(await isAuthorizedAdmin(request, body.secret))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = body.email ? normalizeEmail(body.email) : "";

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }

  // Granting is read-then-write, so two overlapping calls would stack a second
  // Pro period onto the same transfer.
  const lock = await acquireActivationLock(email);

  if (!lock) {
    return NextResponse.json(
      { error: `An activation for ${email} is already in progress.` },
      { status: 409 },
    );
  }

  try {
    const order = await findLatestPendingOrderByEmail(email);

    if (!order) {
      // Distinguish "never ordered" from "already activated" — otherwise it's
      // easy to think activation failed when it already succeeded.
      const existing = await getEntitlement(email);

      if (isEntitlementActive(existing)) {
        return NextResponse.json(
          {
            error: `No pending order for ${email} — this buyer is already Pro until ${existing?.expiresAt}.`,
            entitlement: existing,
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          error: `No pending order found for ${email}. Check the address matches the transfer note exactly.`,
        },
        { status: 404 },
      );
    }

    // Grant first: the entitlement is what the Pro check reads, so a partial
    // failure should leave the buyer with access rather than without it.
    const entitlement = await grantPro({
      email: order.email,
      plan: order.plan,
      orderId: order.id,
      durationDays: order.durationDays,
    });

    const updated = await markOrderPaid(order.id, {
      activatedAt: entitlement.activatedAt,
      expiresAt: entitlement.expiresAt,
    });

    if (!updated) {
      // Pro is live, but the order still reads 'pending' — activating again
      // would stack another period onto it, so flag it loudly.
      console.error(
        `[admin] Granted Pro to ${email} but FAILED to mark order ${order.id} paid.`,
      );

      return NextResponse.json({
        ok: true,
        warning:
          "Pro was granted, but the order could not be updated. Do not run this again for the same transfer.",
        email: entitlement.email,
        plan: entitlement.plan,
        expiresAt: entitlement.expiresAt,
      });
    }

    console.log(
      `[admin] Activated ${updated.planName} for ${updated.email} until ${updated.expiresAt} (order ${updated.id})`,
    );

    return NextResponse.json({
      ok: true,
      email: updated.email,
      plan: updated.plan,
      planName: updated.planName,
      amount: updated.amount,
      status: updated.status,
      activatedAt: updated.activatedAt,
      expiresAt: updated.expiresAt,
      orderId: updated.id,
    });
  } catch (error) {
    console.error("[admin] Activation failed:", error);
    return NextResponse.json({ error: "Activation failed." }, { status: 500 });
  } finally {
    await lock.release();
  }
}
