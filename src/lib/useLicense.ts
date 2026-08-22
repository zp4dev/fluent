"use client";

import { useHydrated, useLocalStorageValue } from "@/lib/browserStore";

const STORAGE_KEY = "fluent.licenseKey";

/**
 * Reads a grandfathered Lemon Squeezy license key out of localStorage.
 *
 * Read-only by design: the redemption UI was removed (commit f1af514) in
 * favour of restore-by-email, so nothing writes this key any more — but buyers
 * who already have one stored must keep their Pro access.
 */
export function useLicense() {
  const stored = useLocalStorageValue(STORAGE_KEY);
  const hydrated = useHydrated();

  // An empty stored value reads as "no license", same as never having set one.
  const licenseKey = stored || null;

  return {
    licenseKey,
    isPro: Boolean(licenseKey),
    hydrated,
  };
}
