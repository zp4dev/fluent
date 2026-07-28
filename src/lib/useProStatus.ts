"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useBuyerEmail } from "@/lib/useBuyerEmail";
import { useLicense } from "@/lib/useLicense";
import { isValidEmail, normalizeEmail } from "@/lib/validateEmail";

/**
 * Client-side Pro status, combining both paths:
 *  - a Lemon Squeezy license key in localStorage (grandfathered buyers)
 *  - a manually activated order for the buyer's email (bank-transfer flow)
 *
 * Either one unlocks the UI. This only drives presentation — the server
 * re-checks with lib/pro.ts before generating Pro-tier content.
 */

export type ProSource = "license" | "order" | null;

/** The answer for one specific address, so a stale result can't leak across emails. */
interface VerifiedEmail {
  email: string;
  isPro: boolean;
  expiresAt: string | null;
}

export function useProStatus() {
  const {
    licenseKey,
    isPro: hasLicense,
    hydrated: licenseHydrated,
    activate,
  } = useLicense();
  const {
    email,
    setEmail,
    hydrated: emailHydrated,
    isValid: emailIsValid,
  } = useBuyerEmail();

  const [verified, setVerified] = useState<VerifiedEmail | null>(null);
  const checkedRef = useRef<string | null>(null);

  const target = emailIsValid ? normalizeEmail(email) : "";

  useEffect(() => {
    // A valid license already unlocks everything — don't bother asking. With no
    // usable email there's nothing to look up, and the derived values below
    // already read as "not Pro", so there's no state to reset here.
    if (!emailHydrated || hasLicense || !target) {
      return;
    }

    if (checkedRef.current === target) {
      return;
    }
    checkedRef.current = target;

    let cancelled = false;

    async function checkEntitlement() {
      try {
        const response = await fetch("/api/pro-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: target }),
        });
        const data = (await response.json()) as {
          isPro?: boolean;
          expiresAt?: string | null;
        };

        if (!cancelled) {
          setVerified({
            email: target,
            isPro: Boolean(data.isPro),
            expiresAt: data.expiresAt ?? null,
          });
        }
      } catch {
        // Network failure just means we stay on the free tier in the UI. Allow a
        // retry on the next render pass rather than caching the failure.
        if (!cancelled) {
          checkedRef.current = null;
          setVerified({ email: target, isPro: false, expiresAt: null });
        }
      }
    }

    checkEntitlement();

    return () => {
      cancelled = true;
    };
  }, [target, emailHydrated, hasLicense]);

  const matches = verified?.email === target && target !== "";
  const orderPro = Boolean(matches && verified?.isPro);
  const expiresAt = matches ? (verified?.expiresAt ?? null) : null;

  /**
   * Restore Pro on a new browser or after cleared storage.
   *
   * The entitlement lives server-side keyed by email, but the client only knows
   * who you are from the email saved at checkout — so re-entering it is enough.
   * Purely local: nothing about the entitlement changes.
   *
   * Only persists the address once it's confirmed Pro, so a wrong guess can't
   * overwrite a working email. Resolves false when there's no active
   * entitlement, throws if the check itself couldn't run.
   */
  const restore = useCallback(
    async (candidate: string): Promise<boolean> => {
      const trimmed = candidate.trim();

      if (!isValidEmail(trimmed)) {
        return false;
      }

      const normalized = normalizeEmail(trimmed);

      const response = await fetch("/api/pro-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });

      if (!response.ok) {
        throw new Error("Pro status check failed.");
      }

      const data = (await response.json()) as {
        isPro?: boolean;
        expiresAt?: string | null;
      };

      if (!data.isPro) {
        return false;
      }

      // Writing through this hook's own seam instance is what makes Pro flip
      // live — a separate useBuyerEmail() here would hold independent state and
      // the change wouldn't be seen until a reload.
      setEmail(normalized);
      checkedRef.current = normalized;
      setVerified({
        email: normalized,
        isPro: true,
        expiresAt: data.expiresAt ?? null,
      });

      return true;
    },
    [setEmail],
  );

  const isPro = hasLicense || orderPro;
  // Nothing to wait for when a license already answered, or when there's no
  // email worth checking.
  const resolved = hasLicense || !target || matches;
  const hydrated = licenseHydrated && emailHydrated && resolved;

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
    restore,
  };
}
