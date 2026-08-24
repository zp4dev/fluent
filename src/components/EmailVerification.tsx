"use client";

import { useState } from "react";

import { useI18n } from "@/lib/i18n/context";
import { rich } from "@/lib/i18n/format";
import { isValidEmail } from "@/lib/validateEmail";

/**
 * Two-step email verification: request a code, then enter it.
 *
 * Shared by checkout and the Pro unlock flow so both prove ownership the same
 * way. On success the server has set a session cookie; the parent reloads its
 * session rather than being handed anything trusted from here.
 */

type Step = "email" | "code";

interface Props {
  /** Prefills the field — a remembered address, never an authenticated one. */
  initialEmail?: string;
  /** Defaults to the translated "verify" label when omitted. */
  submitLabel?: string;
  /**
   * Which endpoint issues the code. The admin flow points this at its own
   * route, which refuses non-admin addresses before paying to send anything.
   * Verification is shared: the code proves the same thing either way.
   */
  sendCodeUrl?: string;
  onVerified: () => void | Promise<void>;
}

const inputClass =
  "mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-3.5 text-base font-semibold text-heading outline-none transition ease-smooth placeholder:text-muted focus:border-primary";

const buttonClass =
  "btn-3d mt-4 w-full cursor-pointer rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

export default function EmailVerification({
  initialEmail = "",
  submitLabel,
  sendCodeUrl = "/api/auth/send-code",
  onVerified,
}: Props) {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const confirmLabel = submitLabel ?? t.auth.verify;

  async function requestCode() {
    const candidate = email.trim();

    if (!isValidEmail(candidate)) {
      setError(t.auth.invalidEmail);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch(sendCodeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: candidate }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        setError(data.error ?? t.auth.sendFailed);
        return;
      }

      setNotice(data.message ?? t.auth.codeSentDefault);
      setStep("code");
    } catch {
      setError(t.auth.sendFailedNetwork);
    } finally {
      setBusy(false);
    }
  }

  async function submitCode() {
    const value = code.trim();

    if (!value) {
      setError(t.auth.enterCode);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: value }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? t.auth.wrongCode);
        return;
      }

      await onVerified();
    } catch {
      setError(t.auth.verifyFailedNetwork);
    } finally {
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <div>
        <p className="text-sm leading-6 text-body">
          {rich(t.auth.codeSentTo, {
            email: (
              <span className="font-extrabold text-translation">
                {email.trim()}
              </span>
            ),
          })}
        </p>

        <label
          htmlFor="verification-code"
          className="mt-4 block text-sm font-extrabold text-heading"
        >
          {t.auth.codeLabel}
        </label>
        <input
          id="verification-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => {
            // Strip first, THEN clamp. A maxLength here would cut the raw
            // pasted string instead — "2 8 6 6 6 2" copied out of the email
            // would lose its last three digits before the spaces came out.
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
            if (error) {
              setError(null);
            }
          }}
          placeholder={t.auth.codePlaceholder}
          className={`${inputClass} text-center text-2xl tracking-[0.4em]`}
        />

        {error ? (
          <p role="alert" className="mt-3 text-sm font-bold text-wrong">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={submitCode}
          disabled={busy || code.length < 6}
          className={buttonClass}
        >
          {busy ? t.auth.verifying : confirmLabel}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep("email");
            setCode("");
            setError(null);
            setNotice(null);
          }}
          className="mt-3 w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-primary"
        >
          {t.auth.changeEmail}
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor="verification-email"
        className="block text-sm font-extrabold text-heading"
      >
        {t.auth.emailLabel}
      </label>
      <input
        id="verification-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) {
            setError(null);
          }
        }}
        placeholder={t.auth.emailPlaceholder}
        className={inputClass}
      />
      <p className="mt-2 text-xs leading-5 text-muted">
        {t.auth.emailHint}
      </p>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-bold text-wrong">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-3 text-sm font-bold text-translation">{notice}</p>
      ) : null}

      <button
        type="button"
        onClick={requestCode}
        disabled={busy || !email.trim()}
        className={buttonClass}
      >
        {busy ? t.auth.sending : t.auth.sendCode}
      </button>
    </div>
  );
}
