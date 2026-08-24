import { NextResponse } from "next/server";

import { readSession, refreshSessionIfStale } from "@/lib/authSession";
import { isProByEmail } from "@/lib/entitlements";

/**
 * Who this browser is, and whether they have Pro.
 *
 * Takes no parameters on purpose — the answer is about the session's own
 * address and nobody else's, which is what stops it being a lookup service.
 */
export async function GET() {
  try {
    const session = await readSession();

    if (!session) {
      return NextResponse.json({ email: null, isPro: false });
    }

    // Someone who keeps using the app should never be logged out.
    await refreshSessionIfStale();

    return NextResponse.json({
      email: session.email,
      isPro: await isProByEmail(session.email),
    });
  } catch (error) {
    console.error("[auth] session lookup failed:", error);
    return NextResponse.json({ email: null, isPro: false }, { status: 500 });
  }
}
