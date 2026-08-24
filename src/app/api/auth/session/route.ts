import { NextResponse } from "next/server";

import { readSession, refreshSessionIfStale } from "@/lib/authSession";
import { getProSummary } from "@/lib/entitlements";

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
      return NextResponse.json({
        email: null,
        isPro: false,
        plan: null,
        daysLeft: null,
      });
    }

    // Someone who keeps using the app should never be logged out.
    await refreshSessionIfStale();

    const summary = await getProSummary(session.email);

    return NextResponse.json({
      email: session.email,
      isPro: summary !== null,
      plan: summary?.plan ?? null,
      daysLeft: summary?.daysLeft ?? null,
    });
  } catch (error) {
    console.error("[auth] session lookup failed:", error);
    return NextResponse.json(
      { email: null, isPro: false, plan: null, daysLeft: null },
      { status: 500 },
    );
  }
}
