"use client";

import { useLicense } from "@/lib/useLicense";
import { useSession } from "@/lib/useSession";

/**
 * Client-side Pro status, combining both paths:
 *  - a Lemon Squeezy license key in localStorage (grandfathered buyers)
 *  - an entitlement for the verified address in the session cookie
 *
 * Either one unlocks the UI. This only drives presentation — the server
 * re-checks with lib/pro.ts before generating Pro-tier content.
 *
 * The email half used to be self-asserted: the client read an address out of
 * localStorage and asked the server about it, so anyone could claim anyone's.
 * That address now has to be proven through the OTP flow before it means
 * anything.
 */

export type ProSource = "license" | "order" | null;

export function useProStatus() {
  const {
    licenseKey,
    isPro: hasLicense,
    hydrated: licenseHydrated,
  } = useLicense();

  const {
    email,
    isPro: sessionPro,
    loaded: sessionLoaded,
    refresh,
    signOut,
  } = useSession();

  const isPro = hasLicense || sessionPro;

  return {
    isPro,
    hydrated: licenseHydrated && sessionLoaded,
    source: (hasLicense ? "license" : sessionPro ? "order" : null) as ProSource,
    /** Still sent to the API so the server can verify the license path. */
    licenseKey,
    /** The verified address, or null when signed out. */
    email,
    /** Re-read the session after signing in. */
    refresh,
    signOut,
  };
}
