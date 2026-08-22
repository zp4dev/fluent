import { NextResponse } from "next/server";

import { readSession } from "@/lib/authSession";
import { isProByEmail } from "@/lib/entitlements";

/**
 * Whether the signed-in browser has Pro.
 *
 * Superseded the old POST {email} form, which would answer for any address
 * given to it and so let anyone confirm who was a paying customer. There is no
 * parameter now: the only address it will talk about is the session's own.
 *
 * Still not the security boundary — Pro-only generation is re-checked in
 * /api/generate-lesson.
 */
export async function GET() {
  try {
    const session = await readSession();

    if (!session) {
      return NextResponse.json({ isPro: false });
    }

    return NextResponse.json({ isPro: await isProByEmail(session.email) });
  } catch (error) {
    console.error("[pro-status] Failed:", error);
    return NextResponse.json({ isPro: false }, { status: 500 });
  }
}
