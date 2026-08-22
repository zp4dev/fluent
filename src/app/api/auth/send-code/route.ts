import { NextResponse } from "next/server";

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
 * Emails a one-time login code.
 *
 * Always answers the same way, whatever happens. Saying "no account with that
 * address" would rebuild exactly the enumeration oracle this whole flow exists
 * to remove — and there is nothing to enumerate anyway: a code can be sent to
 * any address, it just won't unlock Pro unless that address has an entitlement.
 */
export async function POST(request: Request) {
  const t = await getServerDictionary();
  const locale = await getServerLocale();

  // Always answers the same way — see the note above.
  const sameAnswer = { ok: true, message: t.auth.codeSentGeneric };

  try {
    const body = (await request.json()) as { email?: string };
    const raw = body.email?.trim();

    if (!raw || !isValidEmail(raw)) {
      return NextResponse.json(
        { ok: false, error: t.auth.invalidEmail },
        { status: 400 },
      );
    }

    const email = normalizeEmail(raw);

    const [byIp, byEmail] = await Promise.all([
      checkSendCodeIpLimit(getClientIp(request)),
      checkSendCodeEmailLimit(email),
    ]);

    if (!byIp.success || !byEmail.success) {
      return NextResponse.json(
        {
          ok: false,
          error: t.auth.tooManyCodeRequests,
        },
        { status: 429 },
      );
    }

    const code = generateCode();

    if (!(await storeCode(email, code))) {
      // Nowhere to keep the code means it could never be verified — don't mail
      // out something guaranteed to fail.
      return NextResponse.json(
        { ok: false, error: t.auth.cannotSendNow },
        { status: 503 },
      );
    }

    const sent = await sendEmail(email, loginCodeEmail(code, t, locale), `login-${email}-${code}`);

    if (!sent.ok) {
      return NextResponse.json(
        { ok: false, error: t.auth.cannotSendNow },
        { status: 502 },
      );
    }

    console.log(`[auth] Login code sent to ${email}`);
    return NextResponse.json(sameAnswer);
  } catch (error) {
    console.error("[auth] send-code failed:", error);
    return NextResponse.json(
      { ok: false, error: t.auth.cannotSendNow },
      { status: 500 },
    );
  }
}
