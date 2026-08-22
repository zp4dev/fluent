"use client";

import Link from "next/link";
import { useState } from "react";

import EmailVerification from "@/components/EmailVerification";
import { BANK_DETAILS } from "@/lib/bank";
import { useI18n } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fmt, rich } from "@/lib/i18n/format";
import {
  DEFAULT_PLAN_ID,
  PLANS,
  PLAN_ORDER,
  formatVnd,
  type PlanId,
} from "@/lib/plans";
import { useBuyerEmail } from "@/lib/useBuyerEmail";
import { useSession } from "@/lib/useSession";
import { buildVietQrUrl } from "@/lib/vietqr";

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the value is visible on screen anyway.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="shrink-0 cursor-pointer rounded-lg border-2 border-border bg-card px-2.5 py-1 text-xs font-extrabold text-primary transition ease-smooth hover:border-primary hover:bg-highlight"
    >
      {copied ? t.common.copied : t.common.copy}
    </button>
  );
}

/** Centered clickable value — the text itself is the copy control. */
function CopyableText({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the value is still visible.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={t.common.copyHint}
      aria-label={copied ? t.common.copied : fmt(t.common.copyValue, { value })}
      className={`cursor-pointer underline-offset-4 transition ease-smooth hover:underline ${className ?? ""}`}
    >
      {copied ? t.common.copiedCheck : value}
    </button>
  );
}

function DetailRow({
  label,
  value,
  copyable = false,
  copyLabel,
  strong = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  copyLabel?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={`truncate text-sm ${
            strong ? "font-extrabold text-translation" : "font-bold text-heading"
          }`}
        >
          {value}
        </span>
        {copyable && value ? (
          <CopyButton value={value} label={copyLabel ?? label} />
        ) : null}
      </span>
    </div>
  );
}

/**
 * Display copy for a plan. `PLANS[id].name` stays Vietnamese on purpose — it is
 * written into the order record that gets reconciled by hand, so it must not
 * shift with whatever language the buyer happened to be reading in.
 */
function planCopy(id: PlanId, t: Dictionary) {
  return id === "annual"
    ? {
        name: t.plans.annualName,
        period: t.plans.annualPeriod,
        badge: t.plans.annualBadge,
      }
    : {
        name: t.plans.monthlyName,
        period: t.plans.monthlyPeriod,
        badge: null,
      };
}

export default function UpgradeCheckout() {
  const { t } = useI18n();
  const [planId, setPlanId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Remembered from a previous visit purely to prefill the field — it proves
  // nothing on its own.
  const { email: rememberedEmail } = useBuyerEmail();
  const { email, loaded: sessionLoaded, refresh: refreshSession } = useSession();
  const plan = PLANS[planId];
  const planLabels = planCopy(planId, t);

  const verified = Boolean(email);

  // The address is fixed once verified, so the QR is built once — no keystroke
  // debounce needed any more.
  const qrUrl = buildVietQrUrl({
    bankId: BANK_DETAILS.bankId,
    accountNumber: BANK_DETAILS.accountNumber,
    accountName: BANK_DETAILS.accountHolder,
    amount: plan.amount,
    addInfo: email ?? undefined,
  });

  async function handleConfirm() {
    if (!verified) {
      setError(t.checkout.errorVerifyFirst);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // The order's email comes from the session server-side — nothing about
      // the buyer's identity is sent from here.
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? t.checkout.errorNotRecorded);
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t.checkout.errorNotRecordedRetry,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-12 sm:px-6">
        <div className="rounded-3xl border-2 border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <p className="text-5xl">🌱</p>
          <h1 className="mt-5 text-2xl font-extrabold text-heading sm:text-3xl">
            {t.checkout.thanksTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-body">
            {rich(t.checkout.thanksBody, {
              email: (
                <span className="font-extrabold text-translation">{email}</span>
              ),
            })}
          </p>

          <div className="mt-6 rounded-2xl bg-highlight px-5 py-4 text-left">
            <DetailRow label={t.checkout.planRow} value={planLabels.name} />
            <DetailRow
              label={t.checkout.amountRow}
              value={formatVnd(plan.amount)}
              strong
            />
          </div>

          <p className="mt-5 text-sm leading-6 text-muted">
            {t.checkout.thanksFooter}
          </p>

          <Link
            href="/"
            className="btn-3d mt-7 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-primary-hover"
          >
            {t.checkout.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-12 sm:px-6">
      <header className="text-center">
        <Link
          href="/"
          className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-bold text-muted transition ease-smooth hover:text-primary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.common.back}
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-heading sm:text-4xl">
          {t.checkout.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-body">
          {t.checkout.subtitle}
        </p>
      </header>

      {/* Plan toggle */}
      <div
        role="radiogroup"
        aria-label={t.checkout.planGroupAria}
        className="grid gap-3 sm:grid-cols-2"
      >
        {PLAN_ORDER.map((id) => {
          const option = PLANS[id];
          const optionLabels = planCopy(id, t);
          const isActive = id === planId;

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setPlanId(id)}
              className={`relative cursor-pointer rounded-2xl border-2 p-5 text-left transition ease-smooth ${
                isActive
                  ? "border-primary bg-highlight shadow-[0_4px_0_#CA2851]"
                  : "border-border bg-card hover:border-primary"
              }`}
            >
              {optionLabels.badge ? (
                <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                  {optionLabels.badge}
                </span>
              ) : null}

              <p className="text-sm font-extrabold uppercase tracking-wide text-muted">
                {optionLabels.name}
              </p>
              <p className="mt-1.5">
                <span className="text-2xl font-extrabold text-heading">
                  {option.priceLabel}
                </span>
                <span className="text-sm font-bold text-muted">
                  {optionLabels.period}
                </span>
              </p>
              {option.perMonthAmount ? (
                <p className="mt-1 text-xs font-bold text-translation">
                  {fmt(t.plans.annualPerMonth, {
                    amount: formatVnd(option.perMonthAmount),
                  })}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* QR + payment details */}
      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-center text-lg font-extrabold text-heading">
          {t.checkout.scanTitle}
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-muted">
          {t.checkout.scanBody}
        </p>

        <div className="mt-5 flex justify-center px-2 sm:px-4">
          {/* VietQR quick-link image — the amount updates instantly per plan. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={qrUrl}
            src={qrUrl}
            alt={fmt(t.checkout.qrAlt, {
              plan: planLabels.name,
              price: plan.priceLabel,
            })}
            className="h-auto w-full max-w-[300px] rounded-xl object-contain shadow-[0_4px_16px_rgba(45,45,45,0.08)]"
          />
        </div>

        {/* Receipt-style bank details — plain centered text, no box */}
        <div className="mt-5 space-y-1.5 text-center">
          <p className="text-sm font-bold text-heading">
            {BANK_DETAILS.bankName}
          </p>
          <p className="text-sm font-bold text-heading">
            {BANK_DETAILS.accountHolder}
          </p>
          {BANK_DETAILS.accountNumber ? (
            <p>
              <CopyableText
                value={BANK_DETAILS.accountNumber}
                className="text-sm font-bold text-heading hover:text-primary"
              />
            </p>
          ) : (
            <p className="text-sm font-bold text-heading">
              {t.checkout.accountPending}
            </p>
          )}
          <p className="pt-0.5">
            <CopyableText
              value={formatVnd(plan.amount)}
              className="text-base font-extrabold text-translation hover:text-primary-hover"
            />
          </p>
        </div>

        <p className="mt-6 rounded-2xl bg-highlight px-5 py-4 text-center text-sm font-bold leading-6 text-heading">
          {rich(t.checkout.transferNote, {
            amount: (
              <span className="text-translation">{formatVnd(plan.amount)}</span>
            ),
            yourEmail: (
              <span className="text-translation">
                {t.checkout.transferNoteYourEmail}
              </span>
            ),
          })}
        </p>

        {/* Email — verified, because reconciliation is done by hand against it */}
        <div className="mt-6">
          {!sessionLoaded ? (
            <p className="text-sm font-bold text-muted">{t.common.loading}</p>
          ) : verified ? (
            <div className="rounded-2xl border-2 border-border bg-highlight px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                {t.checkout.verifiedEmailLabel}
              </p>
              <p className="mt-1 text-base font-extrabold text-translation">
                {email}
              </p>
            </div>
          ) : (
            <EmailVerification
              initialEmail={rememberedEmail}
              submitLabel={t.checkout.verifyEmailSubmit}
              onVerified={refreshSession}
            />
          )}
        </div>

        {/* Transfer note — must match exactly */}
        <div className="mt-5 rounded-2xl border-2 border-dashed border-accent bg-background px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            {t.checkout.transferContentLabel}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-base font-extrabold text-translation">
              {verified && email ? email : t.checkout.transferContentEmpty}
            </span>
            {verified && email ? (
              <CopyButton
                value={email}
                label={t.checkout.copyTransferContent}
              />
            ) : null}
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border-2 border-wrong bg-wrong-light px-4 py-3 text-sm font-bold text-wrong"
          >
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting || !verified}
          className="btn-3d mt-6 w-full cursor-pointer rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t.checkout.confirming : t.checkout.confirm}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-muted">
          {t.checkout.manualNote}
        </p>
      </div>
    </div>
  );
}
