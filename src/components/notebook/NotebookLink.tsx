"use client";

import Link from "next/link";

import { useI18n } from "@/lib/i18n/context";
import { useNotebooks } from "@/lib/notebook";

/**
 * Header entry point for the notebook.
 *
 * The word count only appears after hydration — it comes from localStorage,
 * which the server cannot see, and rendering a number the server guessed at
 * would be a hydration mismatch.
 */
export default function NotebookLink() {
  const { t } = useI18n();
  const { wordCount, hydrated } = useNotebooks();

  return (
    <Link
      href="/so-tu"
      title={t.notebook.pageTitle}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-border bg-card px-3 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
    >
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
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className="hidden sm:inline">{t.notebook.navLabel}</span>
      {hydrated && wordCount > 0 ? (
        <span className="rounded-full bg-highlight px-1.5 text-xs font-extrabold text-primary">
          {wordCount}
        </span>
      ) : null}
    </Link>
  );
}
