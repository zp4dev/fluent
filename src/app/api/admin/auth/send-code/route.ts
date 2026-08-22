import { NextResponse } from "next/server";

import { isAdminEmail } from "@/lib/admin";
import { sendEmail } from "@/lib/email/resend";
import { loginCodeEmail } from "@/lib/email/templates";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import {
  checkSendCodeEmailLimit,
  checkSendCodeIpLimit,
  getClientIp,
} from "@/lib/ratelimit";
import { generateCode, storeCode } from "@/lib/verificationCode";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

/**
 * Emails a login code, but only to an admin address.
 *
 * Unlike /api/auth/send-code — which answers identically for every address so
 * it can't be used to enumerate customers — this one refuses a non-admin
 * address outright and sends nothing. That is deliberate: every send costs
 * money, and there is no reason to pay for a code that could never grant
 * anything.
 *
 * The trade-off is that this endpoint DOES confirm whether a guessed address
 * is an admin. That is an acceptable leak: the two maintainers are already
 * named in the repo's commit history, and knowing the address is worthless
 * without the code, which still goes only to the real inbox.
 */
export async function POST(request: Request) {
  const t = await getServerDictionary();
  const locale = await getServerLocale();

  try {
    const body = (await request.json()) as { email?: string };
    const raw = body.email?.trim();

    if (!raw || !isValidEmail(raw)) {
      return NextResponse.json(
        { ok: false, error: t.auth.invalidEmail },
        { status: 400 },
      );
    }

    // Limited by IP BEFORE the allowlist check, so the "is this an admin?"
    // answer above can't be hammered to sweep a list of candidate addresses.
    const byIp = await checkSendCodeIpLimit(getClientIp(request));

    if (!byIp.success) {
      return NextResponse.json(
        { ok: false, error: t.auth.tooManyCodeRequests },
        { status: 429 },
      );
    }

    const email = normalizeEmail(raw);

    // The cost saving: refuse here, before Resend is ever called.
    if (!isAdminEmail(email)) {
      console.warn(`[admin-auth] Refused a code for non-admin address: ${email}`);
      return NextResponse.json(
        { ok: false, error: t.admin.notAdmin },
        { status: 403 },
      );
    }

    // Still limited per address, so a leaked admin address can't be used to
    // flood that inbox.
    const byEmail = await checkSendCodeEmailLimit(email);

    if (!byEmail.success) {
      return NextResponse.json(
        { ok: false, error: t.auth.tooManyCodeRequests },
        { status: 429 },
      );
    }

    const code = generateCode();

    if (!(await storeCode(email, code))) {
      // Nothing to verify against later — don't email a code that can't work.
      return NextResponse.json(
        { ok: false, error: t.auth.cannotSendNow },
        { status: 503 },
      );
    }

    const sent = await sendEmail(
      email,
      loginCodeEmail(code, t, locale),
      `admin-login-${email}-${code}`,
    );

    if (!sent.ok) {
      return NextResponse.json(
        { ok: false, error: t.auth.cannotSendNow },
        { status: 502 },
      );
    }

    console.log(`[admin-auth] Sent a login code to ${email}`);

    return NextResponse.json({ ok: true, message: t.auth.codeSentDefault });
  } catch (error) {
    console.error("[admin-auth] Failed to send a login code:", error);
    return NextResponse.json(
      { ok: false, error: t.auth.cannotSendNow },
      { status: 500 },
    );
  }
}
