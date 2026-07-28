"use client";

import Link from "next/link";
import { useState } from "react";

import { BANK_DETAILS } from "@/lib/bank";
import {
  DEFAULT_PLAN_ID,
  PLANS,
  PLAN_ORDER,
  formatVnd,
  type PlanId,
} from "@/lib/plans";
import { useBuyerEmail } from "@/lib/useBuyerEmail";

function CopyButton({ value, label }: { value: string; label: string }) {
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
      {copied ? "Đã chép!" : "Chép"}
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
      title="Nhấn để chép"
      aria-label={copied ? "Đã chép" : `Chép ${value}`}
      className={`cursor-pointer underline-offset-4 transition ease-smooth hover:underline ${className ?? ""}`}
    >
      {copied ? "Đã chép ✓" : value}
    </button>
  );
}

function DetailRow({
  label,
  value,
  copyable = false,
  strong = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
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
          <CopyButton value={value} label={`Chép ${label}`} />
        ) : null}
      </span>
    </div>
  );
}

export default function UpgradeCheckout() {
  const [planId, setPlanId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { email, setEmail, hydrated, isValid } = useBuyerEmail();
  const plan = PLANS[planId];

  async function handleConfirm() {
    if (!isValid) {
      setError("Bạn nhập email trước giúp mình nhé.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), plan: planId }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Không ghi nhận được yêu cầu.");
      }

      setSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không ghi nhận được yêu cầu. Bạn thử lại giúp mình nhé.",
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
            Cảm ơn bạn nhiều nhé!
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-body">
            Pro sẽ được kích hoạt trong vài giờ sau khi mình xác nhận thanh
            toán. Bạn sẽ nhận được email xác nhận tại{" "}
            <span className="font-extrabold text-translation">
              {email.trim()}
            </span>
            .
          </p>

          <div className="mt-6 rounded-2xl bg-highlight px-5 py-4 text-left">
            <DetailRow label="Gói" value={plan.name} />
            <DetailRow label="Số tiền" value={formatVnd(plan.amount)} strong />
          </div>

          <p className="mt-5 text-sm leading-6 text-muted">
            Nếu sau 24 giờ vẫn chưa thấy gì, bạn nhắn cho mình kèm email này để
            mình kiểm tra lại nhé.
          </p>

          <Link
            href="/"
            className="btn-3d mt-7 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-primary-hover"
          >
            Về trang chủ
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
          Quay lại
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-heading sm:text-4xl">
          Nâng cấp Fluent Pro
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-body">
          Mở khóa nghĩa mở rộng, cụm từ đi kèm và họ từ vựng cho mọi từ trong
          mọi bài học.
        </p>
      </header>

      {/* Plan toggle */}
      <div
        role="radiogroup"
        aria-label="Chọn gói Pro"
        className="grid gap-3 sm:grid-cols-2"
      >
        {PLAN_ORDER.map((id) => {
          const option = PLANS[id];
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
              {option.badge ? (
                <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                  {option.badge}
                </span>
              ) : null}

              <p className="text-sm font-extrabold uppercase tracking-wide text-muted">
                {option.name}
              </p>
              <p className="mt-1.5">
                <span className="text-2xl font-extrabold text-heading">
                  {option.priceLabel}
                </span>
                <span className="text-sm font-bold text-muted">
                  {option.periodLabel}
                </span>
              </p>
              {option.perMonthLabel ? (
                <p className="mt-1 text-xs font-bold text-translation">
                  {option.perMonthLabel}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* QR + payment details */}
      <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="text-center text-lg font-extrabold text-heading">
          Quét mã để chuyển khoản
        </h2>
        <p className="mt-2 text-center text-sm leading-6 text-muted">
          Mở app ngân hàng của bạn, chọn quét mã QR và quét mã bên dưới.
        </p>

        <div className="mt-5 flex justify-center px-2 sm:px-4">
          {/* Static, plan-specific VietQR — the amount is baked into the code. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={plan.qrSrc}
            src={plan.qrSrc}
            alt={`Mã VietQR cho gói ${plan.name} — ${plan.priceLabel}`}
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
            <p className="text-sm font-bold text-heading">Đang cập nhật</p>
          )}
          <p className="pt-0.5">
            <CopyableText
              value={formatVnd(plan.amount)}
              className="text-base font-extrabold text-translation hover:text-primary-hover"
            />
          </p>
        </div>

        <p className="mt-6 rounded-2xl bg-highlight px-5 py-4 text-center text-sm font-bold leading-6 text-heading">
          Chuyển đúng{" "}
          <span className="text-translation">{formatVnd(plan.amount)}</span> và
          ghi <span className="text-translation">email của bạn</span> vào nội
          dung chuyển khoản để mình đối chiếu nhé.
        </p>

        {/* Email — the key that matches a transfer to an account */}
        <div className="mt-6">
          <label
            htmlFor="buyer-email"
            className="block text-sm font-extrabold text-heading"
          >
            Email của bạn
          </label>
          <input
            id="buyer-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={hydrated ? email : ""}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder="ban@email.com"
            className="mt-2 w-full rounded-2xl border-2 border-border bg-background px-4 py-3.5 text-base font-semibold text-heading outline-none transition ease-smooth placeholder:text-muted focus:border-primary"
          />
          <p className="mt-2 text-xs leading-5 text-muted">
            Mình dùng email này để kích hoạt Pro và gửi xác nhận cho bạn.
          </p>
        </div>

        {/* Transfer note — must match exactly */}
        <div className="mt-5 rounded-2xl border-2 border-dashed border-accent bg-background px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">
            Nội dung chuyển khoản
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-base font-extrabold text-translation">
              {isValid ? email.trim() : "— nhập email phía trên —"}
            </span>
            {isValid ? (
              <CopyButton
                value={email.trim()}
                label="Chép nội dung chuyển khoản"
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
          disabled={submitting || !isValid}
          className="btn-3d mt-6 w-full cursor-pointer rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Đang ghi nhận..." : "Mình đã chuyển khoản"}
        </button>

        <p className="mt-3 text-center text-xs leading-5 text-muted">
          Mình kiểm tra thủ công nên Pro không kích hoạt ngay lập tức — thường
          trong vài giờ.
        </p>
      </div>
    </div>
  );
}
