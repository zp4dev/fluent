"use client";

import Link from "next/link";
import { useState } from "react";

import { CHECKOUT_URL } from "@/lib/checkout";
import type { Lesson } from "@/types/lesson";

interface DownloadPdfButtonProps {
  lesson: Lesson;
  videoId: string;
  isPro: boolean;
}

function DownloadIcon() {
  // Matches the 14x14 play icon on "Xem video gốc" — arrow into a tray.
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
  isPro,
}: DownloadPdfButtonProps) {
  const [showUpsell, setShowUpsell] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  function handleClick() {
    // PDF generation is parked — see src/lib/lessonPdf.tsx. Never load the
    // heavy @react-pdf/renderer library from this button.
    if (!isPro) {
      setShowComingSoon(false);
      setShowUpsell(true);
      return;
    }

    setShowUpsell(false);
    setShowComingSoon(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
      >
        <DownloadIcon />
        Tải PDF
      </button>

      {showComingSoon ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-coming-soon-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setShowComingSoon(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl">📄</p>
            <h2
              id="pdf-coming-soon-title"
              className="mt-4 text-2xl font-extrabold text-heading"
            >
              Sắp có rồi!
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              Tính năng tải PDF đang được hoàn thiện. Cảm ơn bạn đã chờ — mình
              sẽ sớm mang đến nhé!
            </p>
            <button
              type="button"
              onClick={() => setShowComingSoon(false)}
              className="btn-3d mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              Đã hiểu
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
              Tải PDF là tính năng Pro
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              Nâng cấp Pro để tải bài học dưới dạng PDF đẹp mắt — dùng để in,
              ôn tập và luyện viết ngay trên giấy.
            </p>
            <Link
              href={CHECKOUT_URL}
              className="btn-3d mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              Nâng cấp Pro ☕
            </Link>
            <button
              type="button"
              onClick={() => setShowUpsell(false)}
              className="mt-4 block w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-body"
            >
              Để sau
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
