import { NextResponse } from "next/server";

import { startSession } from "@/lib/authSession";
import { checkVerifyCodeLimit, getClientIp } from "@/lib/ratelimit";
import { verifyCode } from "@/lib/verificationCode";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

/**
 * Exchanges a valid code for a session cookie. This is the only place a
 * browser can come to be trusted with an email address.
 */
export async function POST(request: Request) {
  try {
    const rateLimit = await checkVerifyCodeLimit(getClientIp(request));

    if (!rateLimit.success) {
      return NextResponse.json(
        { ok: false, error: "Bạn thử quá nhiều lần. Thử lại sau một giờ nhé." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { email?: string; code?: string };
    const raw = body.email?.trim();
    const code = body.code?.trim();

    if (!raw || !isValidEmail(raw) || !code) {
      return NextResponse.json(
        { ok: false, error: "Bạn nhập email và mã xác thực giúp mình nhé." },
        { status: 400 },
      );
    }

    const email = normalizeEmail(raw);
    const result = await verifyCode(email, code);

    if (!result.ok) {
      const error =
        result.reason === "expired"
          ? "Mã đã hết hạn hoặc không còn dùng được. Bạn yêu cầu mã mới nhé."
          : `Mã không đúng. Bạn còn ${result.attemptsLeft} lần thử.`;

      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    if (!(await startSession(email))) {
      return NextResponse.json(
        { ok: false, error: "Chưa đăng nhập được lúc này. Bạn thử lại sau nhé." },
        { status: 500 },
      );
    }

    console.log(`[auth] Session started for ${email}`);
    return NextResponse.json({ ok: true, email });
  } catch (error) {
    console.error("[auth] verify-code failed:", error);
    return NextResponse.json(
      { ok: false, error: "Chưa đăng nhập được lúc này. Bạn thử lại sau nhé." },
      { status: 500 },
    );
  }
}
