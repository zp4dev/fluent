"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import EmailVerification from "@/components/EmailVerification";
import { useI18n } from "@/lib/i18n/context";

function LoginIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
    </svg>
  );
}

/**
 * The signed-out counterpart to LogoutButton — the parent renders exactly one
 * of the two from the session cookie, so the header is already correct in the
 * first paint.
 *
 * Sign-in was previously only reachable from the "restore Pro" corner of the
 * generator, which meant someone who already had an account had no obvious way
 * back in. The dialog reuses EmailVerification, so this is the same OTP flow
 * checkout and the admin console use, not a second way to become trusted.
 */
export default function LoginButton() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Escape closes, matching what the backdrop click already offers.
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t.auth.signIn}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
      >
        <LoginIcon />
        <span className="hidden sm:inline">{t.auth.signIn}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="login-dialog-title"
              className="text-2xl font-extrabold text-heading"
            >
              {t.auth.signInTitle}
            </h2>
            <p className="mt-2 mb-5 text-sm leading-6 text-body">
              {t.auth.signInBody}
            </p>

            <EmailVerification
              submitLabel={t.auth.signIn}
              onVerified={() => {
                setOpen(false);
                // The header renders from the session cookie server-side, so
                // the page has to re-render for the sign-in to show up — the
                // same reason LogoutButton refreshes on the way out.
                router.refresh();
              }}
            />

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 block w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-body"
            >
              {t.common.later}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
