import { NextResponse } from "next/server";

import { fmt } from "@/lib/i18n/format";
import { getServerDictionary } from "@/lib/i18n/server";

import { startSession } from "@/lib/authSession";
import { checkVerifyCodeLimit, getClientIp } from "@/lib/ratelimit";
import { verifyCode } from "@/lib/verificationCode";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

/**
 * Exchanges a valid code for a session cookie. This is the only place a
 * browser can come to be trusted with an email address.
 */
export async function POST(request: Request) {
  const t = await getServerDictionary();

  try {
    const rateLimit = await checkVerifyCodeLimit(getClientIp(request));

    if (!rateLimit.success) {
      return NextResponse.json(
        { ok: false, error: t.auth.tooManyAttempts },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { email?: string; code?: string };
    const raw = body.email?.trim();
    const code = body.code?.trim();

    if (!raw || !isValidEmail(raw) || !code) {
      return NextResponse.json(
        { ok: false, error: t.auth.missingEmailOrCode },
        { status: 400 },
      );
    }

    const email = normalizeEmail(raw);
    const result = await verifyCode(email, code);

    if (!result.ok) {
      const error =
        result.reason === "expired"
          ? t.auth.codeExpired
          : fmt(t.auth.wrongCodeAttempts, { attempts: result.attemptsLeft });

      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    if (!(await startSession(email))) {
      return NextResponse.json(
        { ok: false, error: t.auth.cannotSignIn },
        { status: 500 },
      );
    }

    console.log(`[auth] Session started for ${email}`);
    return NextResponse.json({ ok: true, email });
  } catch (error) {
    console.error("[auth] verify-code failed:", error);
    return NextResponse.json(
      { ok: false, error: t.auth.cannotSignIn },
      { status: 500 },
    );
  }
}
