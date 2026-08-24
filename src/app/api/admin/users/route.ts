import { NextResponse } from "next/server";

import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { grantPro, revokePro } from "@/lib/entitlements";
import { isPlanId, isTrialDurationDays } from "@/lib/plans";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

/**
 * Admin user management: grant Pro outright, or end it early.
 *
 * Granting here deliberately skips the OTP. That flow exists to stop a browser
 * claiming an address it does not own; an admin typing an address into the
 * console is not making that claim, and mailing a code to a customer who never
 * asked for one would be both confusing and an avoidable cost.
 *
 * The price of skipping it is that a typo grants Pro to whoever owns the
 * mistyped address, so the console asks for confirmation before calling this.
 *
 * Both actions require the same admin proof as every other /api/admin route:
 * an allowlisted session, or the shared secret.
 */
export async function POST(request: Request) {
  let body: {
    action?: string;
    email?: string;
    plan?: string;
    durationDays?: string;
    secret?: string;
  };

  try {
    body = (await request.json()) as typeof body;
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

  if (body.action === "revoke") {
    try {
      const revoked = await revokePro(email);

      if (!revoked) {
        return NextResponse.json(
          { error: `No entitlement found for ${email}.` },
          { status: 404 },
        );
      }

      console.log(`[admin] Revoked Pro for ${email}`);

      return NextResponse.json({
        ok: true,
        email: revoked.email,
        expiresAt: revoked.expiresAt,
        revokedAt: revoked.revokedAt,
      });
    } catch (error) {
      console.error("[admin] Revoke failed:", error);
      return NextResponse.json({ error: "Revoke failed." }, { status: 500 });
    }
  }

  if (body.action === "grant") {
    const isTrial = body.plan === "trial";

    if (!isTrial && !isPlanId(body.plan)) {
      return NextResponse.json(
        { error: "A valid plan is required." },
        { status: 400 },
      );
    }

    let trialDurationDays: number | undefined;
    if (isTrial) {
      const parsed = Number(body.durationDays);
      if (!isTrialDurationDays(parsed)) {
        return NextResponse.json(
          { error: "A valid trial duration (1, 3, or 7 days) is required." },
          { status: 400 },
        );
      }
      trialDurationDays = parsed;
    }

    try {
      // No orderId: nothing was paid for through checkout, and pretending
      // otherwise would put a phantom order in the reconciliation trail.
      const entitlement = await grantPro({
        email,
        plan: isTrial ? "trial" : (body.plan as "annual" | "monthly"),
        durationDays: trialDurationDays,
      });

      console.log(
        `[admin] Granted ${body.plan} Pro to ${email} until ${entitlement.expiresAt}`,
      );

      return NextResponse.json({
        ok: true,
        email: entitlement.email,
        plan: entitlement.plan,
        expiresAt: entitlement.expiresAt,
      });
    } catch (error) {
      console.error("[admin] Grant failed:", error);
      return NextResponse.json({ error: "Grant failed." }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Unknown action. Expected 'grant' or 'revoke'." },
    { status: 400 },
  );
}
