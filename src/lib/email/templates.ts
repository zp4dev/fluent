/** Minutes a code stays valid — must match TTL_SECONDS in lib/verificationCode.ts. */
const VALID_MINUTES = 10;

export interface EmailBody {
  subject: string;
  html: string;
  text: string;
}

/**
 * The login-code email. Deliberately plain: no images, no tracking, one clear
 * number. Heavy HTML is what gets a transactional mail filed as spam, and a
 * code that lands in spam is a paying customer locked out.
 */
export function loginCodeEmail(code: string): EmailBody {
  return {
    subject: `${code} là mã đăng nhập Fluent của bạn`,
    text: [
      "Mã đăng nhập Fluent của bạn:",
      "",
      code,
      "",
      `Mã có hiệu lực trong ${VALID_MINUTES} phút.`,
      "Nếu bạn không yêu cầu mã này, bạn có thể bỏ qua email.",
      "",
      "— Fluent",
    ].join("\n"),
    html: `<!doctype html>
<html lang="vi">
  <body style="margin:0;padding:24px;background:#fff8f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#2d2d2d;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;">Mã đăng nhập Fluent</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
        Nhập mã dưới đây để mở khóa tài khoản của bạn:
      </p>
      <!-- Spacing comes from letter-spacing, never from spaces in the text:
           the digits must survive a copy-paste as one unbroken number. -->
      <p style="margin:0 0 24px;font-size:32px;font-weight:800;letter-spacing:6px;color:#ca2851;text-align:center;">${code}</p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#6b6b6b;">
        Mã có hiệu lực trong ${VALID_MINUTES} phút.
      </p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#6b6b6b;">
        Nếu bạn không yêu cầu mã này, bạn có thể bỏ qua email.
      </p>
    </div>
  </body>
</html>`,
  };
}
