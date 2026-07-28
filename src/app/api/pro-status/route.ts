import { NextResponse } from "next/server";

import { getEntitlement, isEntitlementActive } from "@/lib/entitlements";
import { isValidEmail } from "@/lib/validateEmail";

/**
 * Tells the client whether an email currently has Pro, so the UI can unlock
 * without a license key. POST (not GET) so the address stays out of URLs and
 * access logs.
 *
 * This is not the security boundary — Pro-only generation is re-checked
 * server-side in /api/generate-lesson.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ isPro: false });
    }

    const entitlement = await getEntitlement(email);

    if (!isEntitlementActive(entitlement)) {
      return NextResponse.json({ isPro: false });
    }

    return NextResponse.json({
      isPro: true,
      plan: entitlement?.plan ?? null,
      expiresAt: entitlement?.expiresAt ?? null,
    });
  } catch (error) {
    console.error("[pro-status] Failed:", error);
    return NextResponse.json({ isPro: false }, { status: 500 });
  }
}
