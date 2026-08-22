import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { loginCodeEmail } from "@/lib/email/templates";
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
const SAME_ANSWER = {
  ok: true,
  message: "Nếu email hợp lệ, mã xác thực đã được gửi. Bạn kiểm tra hộp thư nhé.",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const raw = body.email?.trim();

    if (!raw || !isValidEmail(raw)) {
      return NextResponse.json(
        { ok: false, error: "Email chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé." },
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
          error: "Bạn đã yêu cầu mã quá nhiều lần. Thử lại sau một giờ nhé.",
        },
        { status: 429 },
      );
    }

    const code = generateCode();

    if (!(await storeCode(email, code))) {
      // Nowhere to keep the code means it could never be verified — don't mail
      // out something guaranteed to fail.
      return NextResponse.json(
        { ok: false, error: "Chưa gửi được mã lúc này. Bạn thử lại sau nhé." },
        { status: 503 },
      );
    }

    const sent = await sendEmail(email, loginCodeEmail(code), `login-${email}-${code}`);

    if (!sent.ok) {
      return NextResponse.json(
        { ok: false, error: "Chưa gửi được mã lúc này. Bạn thử lại sau nhé." },
        { status: 502 },
      );
    }

    console.log(`[auth] Login code sent to ${email}`);
    return NextResponse.json(SAME_ANSWER);
  } catch (error) {
    console.error("[auth] send-code failed:", error);
    return NextResponse.json(
      { ok: false, error: "Chưa gửi được mã lúc này. Bạn thử lại sau nhé." },
      { status: 500 },
    );
  }
}
