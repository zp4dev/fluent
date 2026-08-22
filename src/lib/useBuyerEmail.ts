"use client";

import { useCallback, useState } from "react";

import {
  useHydrated,
  useLocalStorageValue,
  writeLocalStorage,
} from "@/lib/browserStore";
import { isValidEmail } from "@/lib/validateEmail";

/**
 * Remembers the last address typed at checkout, purely to prefill the field.
 *
 * This used to be the auth seam — the stored address WAS the identity, which
 * meant anyone who knew a customer's email could use their Pro. Identity now
 * comes from a verified session (lib/authSession.ts, lib/useSession.ts) and
 * this value proves nothing on its own. Treat it as a convenience only, and
 * never as evidence of who someone is.
 */

const STORAGE_KEY = "fluent.buyerEmail";

export function useBuyerEmail() {
  const stored = useLocalStorageValue(STORAGE_KEY);
  const hydrated = useHydrated();

  // What the buyer has typed this session, kept verbatim. Storage holds the
  // trimmed address, but the input must show exactly what was typed — so the
  // draft wins until they've touched the field.
  const [draft, setDraft] = useState<string | null>(null);
  const email = draft ?? stored ?? "";

  const setEmail = useCallback((value: string) => {
    setDraft(value);
    writeLocalStorage(STORAGE_KEY, value.trim());
  }, []);

  return {
    email,
    setEmail,
    hydrated,
    /** True once the address looks well-formed enough to submit. */
    isValid: isValidEmail(email),
  };
}
