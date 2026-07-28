"use client";

import { useCallback, useEffect, useState } from "react";

import { isValidEmail } from "@/lib/validateEmail";

/**
 * AUTH SEAM.
 *
 * Fluent has no accounts yet, so the buyer types their email on the checkout
 * page and it's remembered locally. That email is the key that matches a bank
 * transfer to a person when Pro is activated by hand.
 *
 * When real auth lands, this hook is the only thing that needs to change:
 * return the session's email and mark it read-only, and the checkout UI keeps
 * working as-is.
 */

const STORAGE_KEY = "fluent.buyerEmail";

export function useBuyerEmail() {
  const [email, setEmailState] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEmailState(stored);
      }
    } catch {
      // Storage may be unavailable; start with an empty field.
    }
    setHydrated(true);
  }, []);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value.trim());
    } catch {
      // Ignore write failures (private mode, quota).
    }
  }, []);

  return {
    email,
    setEmail,
    hydrated,
    /** True once the address looks well-formed enough to submit. */
    isValid: isValidEmail(email),
  };
}
