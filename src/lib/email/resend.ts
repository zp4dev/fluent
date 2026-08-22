import type { EmailBody } from "@/lib/email/templates";

/**
 * Sends transactional mail through Resend's HTTP API.
 *
 * Raw fetch rather than the SDK — one endpoint, one shape, no dependency to
 * keep current. See https://resend.com/docs/api-reference/emails/send-email
 */

const ENDPOINT = "https://api.resend.com/emails";

export interface SendResult {
  ok: boolean;
}

/**
 * `idempotencyKey` lets a retry of the same logical send collapse into one
 * delivery instead of mailing the recipient twice.
 *
 * Never throws a provider message onward: failures are logged in full here and
 * reported to the caller as a bare false, so an API key or a Resend response
 * body can't ride an error string out to a user.
 */
export async function sendEmail(
  to: string,
  body: EmailBody,
  idempotencyKey?: string,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.error(
      "[email] RESEND_API_KEY or EMAIL_FROM is not set — cannot send mail.",
    );
    return { ok: false };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to,
        subject: body.subject,
        html: body.html,
        text: body.text,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`[email] Resend rejected the send (${response.status}):`, detail);
      return { ok: false };
    }

    return { ok: true };
  } catch (error) {
    console.error("[email] Failed to reach Resend:", error);
    return { ok: false };
  }
}
