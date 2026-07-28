"use client";

import { useEffect, useState } from "react";

import { useBuyerEmail } from "@/lib/useBuyerEmail";
import { useLicense } from "@/lib/useLicense";

/**
 * Client-side Pro status, combining both paths:
 *  - a Lemon Squeezy license key in localStorage (grandfathered buyers)
 *  - a manually activated order for the buyer's email (bank-transfer flow)
 *
 * Either one unlocks the UI. This only drives presentation — the server
 * re-checks with lib/pro.ts before generating Pro-tier content.
 */

export type ProSource = "license" | "order" | null;

export function useProStatus() {
  const {
    licenseKey,
    isPro: hasLicense,
    hydrated: licenseHydrated,
    activate,
  } = useLicense();
  const { email, hydrated: emailHydrated, isValid: emailIsValid } =
    useBuyerEmail();

  const [orderPro, setOrderPro] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // A valid license already unlocks everything — don't bother asking.
    if (!emailHydrated || hasLicense) {
      return;
    }

    if (!emailIsValid) {
      setOrderPro(false);
      setExpiresAt(null);
      setChecked(true);
      return;
    }

    let cancelled = false;

    async function checkEntitlement() {
      try {
        const response = await fetch("/api/pro-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });
        const data = (await response.json()) as {
          isPro?: boolean;
          expiresAt?: string | null;
        };

        if (!cancelled) {
          setOrderPro(Boolean(data.isPro));
          setExpiresAt(data.expiresAt ?? null);
        }
      } catch {
        // Network failure just means we stay on the free tier in the UI.
        if (!cancelled) {
          setOrderPro(false);
          setExpiresAt(null);
        }
      } finally {
        if (!cancelled) {
          setChecked(true);
        }
      }
    }

    checkEntitlement();

    return () => {
      cancelled = true;
    };
  }, [email, emailHydrated, emailIsValid, hasLicense]);

  const isPro = hasLicense || orderPro;
  const hydrated = licenseHydrated && emailHydrated && (hasLicense || checked);

  return {
    isPro,
    hydrated,
    source: (hasLicense ? "license" : orderPro ? "order" : null) as ProSource,
    expiresAt,
    /** Still sent to the API so the server can verify the license path. */
    licenseKey,
    email,
    /**
     * Re-exported so callers use this hook's single useLicense instance —
     * calling useLicense() separately would create independent state and the
     * newly activated key wouldn't be seen here.
     */
    activate,
  };
}
