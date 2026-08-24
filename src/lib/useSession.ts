"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The signed-in address and its Pro status, straight from the server.
 *
 * Replaced the old arrangement where the client read an email out of
 * localStorage and asked the server about it. Storage can't prove anything —
 * the session cookie can, so the server is the only source of identity now.
 */

export interface SessionState {
  email: string | null;
  isPro: boolean;
  /** False until the first lookup lands, so the UI can avoid flashing. */
  loaded: boolean;
}

const SIGNED_OUT: SessionState = { email: null, isPro: false, loaded: true };

/** A network blip just reads as signed out; a later refresh can recover. */
async function fetchSession(): Promise<SessionState> {
  try {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    const data = (await response.json()) as {
      email?: string | null;
      isPro?: boolean;
    };

    return {
      email: data.email ?? null,
      isPro: Boolean(data.isPro),
      loaded: true,
    };
  } catch {
    return SIGNED_OUT;
  }
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    email: null,
    isPro: false,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;

    fetchSession().then((next) => {
      // Guard against a response landing after unmount, or after a newer
      // sign-in has already updated the state.
      if (!cancelled) {
        setState(next);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /** Re-read after signing in or out elsewhere in the tree. */
  const refresh = useCallback(async () => {
    setState(await fetchSession());
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if the call fails, drop the local view of the session.
    }
    setState(SIGNED_OUT);
  }, []);

  return { ...state, refresh, signOut };
}
