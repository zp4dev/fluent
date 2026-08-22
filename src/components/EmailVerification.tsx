"use client";

import { useState } from "react";

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
  submitLabel?: string;
  onVerified: () => void | Promise<void>;
}

const inputClass =
  "mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-3.5 text-base font-semibold text-heading outline-none transition ease-smooth placeholder:text-muted focus:border-primary";

const buttonClass =
  "btn-3d mt-4 w-full cursor-pointer rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50";

export default function EmailVerification({
  initialEmail = "",
  submitLabel = "Xác thực",
  onVerified,
}: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function requestCode() {
    const candidate = email.trim();

    if (!isValidEmail(candidate)) {
      setError("Email chưa hợp lệ. Bạn kiểm tra lại giúp mình nhé.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-code", {
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
        setError(data.error ?? "Chưa gửi được mã. Bạn thử lại sau nhé.");
        return;
      }

      setNotice(data.message ?? "Mã xác thực đã được gửi.");
      setStep("code");
    } catch {
      setError("Chưa gửi được mã. Bạn kiểm tra kết nối rồi thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode() {
    const value = code.trim();

    if (!value) {
      setError("Bạn nhập mã trong email giúp mình nhé.");
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
        setError(data.error ?? "Mã không đúng. Bạn thử lại nhé.");
        return;
      }

      await onVerified();
    } catch {
      setError("Chưa xác thực được. Bạn kiểm tra kết nối rồi thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <div>
        <p className="text-sm leading-6 text-body">
          Mình đã gửi mã 6 số tới{" "}
          <span className="font-extrabold text-translation">{email.trim()}</span>.
          Mã có hiệu lực trong 10 phút.
        </p>

        <label
          htmlFor="verification-code"
          className="mt-4 block text-sm font-extrabold text-heading"
        >
          Mã xác thực
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
          placeholder="000000"
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
          {busy ? "Đang kiểm tra..." : submitLabel}
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
          Đổi email hoặc gửi lại mã
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
        Email của bạn
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
        placeholder="ban@email.com"
        className={inputClass}
      />
      <p className="mt-2 text-xs leading-5 text-muted">
        Mình gửi một mã 6 số tới email này để xác nhận đúng là bạn.
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
        {busy ? "Đang gửi..." : "Gửi mã xác thực"}
      </button>
    </div>
  );
}
