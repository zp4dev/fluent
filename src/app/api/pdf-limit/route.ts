import { NextResponse } from "next/server";

import { readSession } from "@/lib/authSession";
import { getServerDictionary } from "@/lib/i18n/server";
import { PDF_LIMIT_CODE, checkPdfLimit } from "@/lib/pdfLimit";
import { isProUser } from "@/lib/pro";
import { getProDailyIdentifier } from "@/lib/proDailyLimit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * Gate for PDF export: confirms Pro server-side and consumes one unit of the
 * hourly export quota. Called right before the client generates the PDF —
 * the render itself is entirely client-side (lib/lessonPdf.tsx), so this
 * route does no PDF work of its own, just the two checks a client can't be
 * trusted to run on itself.
 */
export async function POST(request: Request) {
  const t = await getServerDictionary();

  try {
    const body = (await request.json().catch(() => ({}))) as {
      licenseKey?: string;
    };

    const session = await readSession();

    const isPro = await isProUser({
      email: session?.email,
      licenseKey: body.licenseKey,
    });

    if (!isPro) {
      return NextResponse.json({ error: t.pdf.notPro }, { status: 403 });
    }

    const identifier =
      getProDailyIdentifier({
        email: session?.email,
        licenseKey: body.licenseKey,
      }) ?? `ip:${getClientIp(request)}`;

    const result = await checkPdfLimit(identifier);

    if (!result.success) {
      return NextResponse.json(
        { error: t.pdf.limitReached, code: PDF_LIMIT_CODE },
        { status: 429 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[pdf-limit] Failed:", error);
    return NextResponse.json({ error: t.pdf.downloadFailed }, { status: 500 });
  }
}
