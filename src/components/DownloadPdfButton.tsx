"use client";

import Link from "next/link";
import { useState } from "react";

import { CHECKOUT_URL } from "@/lib/checkout";
import { useI18n } from "@/lib/i18n/context";
import { PDF_LIMIT_CODE } from "@/lib/pdfLimitShared";
import type { Lesson } from "@/types/lesson";

interface DownloadPdfButtonProps {
  lesson: Lesson;
  videoId: string;
  isPro: boolean;
  /** Sent to /api/pdf-limit so grandfathered license buyers pass the Pro check too. */
  licenseKey?: string | null;
}

function DownloadIcon() {
  // Matches the 14x14 play icon on the "watch original" link — arrow into a tray.
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v11m0 0l-4-4m4 4l4-4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DownloadPdfButton({
  lesson,
  videoId,
  isPro,
  licenseKey,
}: DownloadPdfButtonProps) {
  const { t } = useI18n();
  const [showUpsell, setShowUpsell] = useState(false);
  const [showLimitReached, setShowLimitReached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!isPro) {
      setError(null);
      setShowLimitReached(false);
      setShowUpsell(true);
      return;
    }

    setShowUpsell(false);
    setShowLimitReached(false);
    setError(null);
    setDownloading(true);

    // Split into two stages — the quota check and the actual render — so a
    // failure logs which one it was instead of collapsing into one generic
    // message that gives no clue where to look next.
    try {
      // Re-checked server-side rather than trusted from the `isPro` prop: it
      // also consumes one unit of the hourly export quota, which a client
      // value can't be trusted to do to itself.
      const response = await fetch("/api/pdf-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: licenseKey ?? undefined }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string; code?: string };

      if (!response.ok || !data.ok) {
        if (data.code === PDF_LIMIT_CODE) {
          setShowLimitReached(true);
        } else {
          setError(data.error ?? t.pdf.downloadFailed);
        }
        return;
      }
    } catch (checkError) {
      console.error("[pdf] Quota check failed:", checkError);
      setError(t.pdf.downloadFailed);
      setDownloading(false);
      return;
    }

    try {
      // Loaded only now — never at render — so free users don't pay for
      // @react-pdf/renderer's bundle size.
      const { downloadLessonPdf } = await import("@/lib/lessonPdf");
      await downloadLessonPdf(lesson, videoId);
    } catch (renderError) {
      console.error("[pdf] Render/download failed:", renderError);
      setError(t.pdf.downloadFailed);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={downloading}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-60"
      >
        <DownloadIcon />
        {downloading ? t.pdf.downloading : t.pdf.download}
      </button>

      {error ? (
        <p role="alert" className="mt-2 w-full text-xs font-bold text-wrong">
          {error}
        </p>
      ) : null}

      {showLimitReached ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-limit-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setShowLimitReached(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl">⏳</p>
            <h2
              id="pdf-limit-title"
              className="mt-4 text-2xl font-extrabold text-heading"
            >
              {t.pdf.limitReachedTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              {t.pdf.limitReachedBody}
            </p>
            <button
              type="button"
              onClick={() => setShowLimitReached(false)}
              className="btn-3d mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              {t.common.gotIt}
            </button>
          </div>
        </div>
      ) : null}

      {showUpsell ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-upsell-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setShowUpsell(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl">📄</p>
            <h2
              id="pdf-upsell-title"
              className="mt-4 text-2xl font-extrabold text-heading"
            >
              {t.pdf.upsellTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              {t.pdf.upsellBody}
            </p>
            <Link
              href={CHECKOUT_URL}
              className="btn-3d mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              {t.pdf.upsellCta}
            </Link>
            <button
              type="button"
              onClick={() => setShowUpsell(false)}
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
