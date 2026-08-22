"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17l5-5-5-5M20 12H9M12 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Only rendered for a signed-in visitor — the parent decides that from the
 * session cookie server-side, so the button is present in the very first paint
 * rather than appearing a moment later once a fetch lands.
 */
export default function LogoutButton({ email }: { email: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // The cookie may well be gone anyway; refreshing below settles it.
    }

    // The server decides whether this button exists at all, so re-render it
    // rather than hiding the button locally and leaving the rest of the page
    // still rendered as signed in.
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      aria-label={t.auth.signOut}
      title={fmt(t.auth.signOutFrom, { email })}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-card text-heading shadow-sm transition ease-smooth hover:border-wrong hover:bg-highlight hover:text-wrong disabled:cursor-not-allowed disabled:opacity-50"
    >
      <LogoutIcon />
    </button>
  );
}
