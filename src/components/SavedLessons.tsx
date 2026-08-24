"use client";

import { useState } from "react";

import { LOCALE_INFO, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fmt } from "@/lib/i18n/format";
import type { SavedLessonMeta } from "@/lib/savedLessons";

interface SavedLessonsProps {
  items: SavedLessonMeta[];
  onSelect: (videoId: string) => void;
  onDelete: (videoId: string) => void;
}

function relativeDate(
  savedAt: number,
  t: Dictionary,
  locale: Locale,
): string {
  const now = new Date();
  const then = new Date(savedAt);

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfThen = new Date(
    then.getFullYear(),
    then.getMonth(),
    then.getDate(),
  ).getTime();

  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((startOfToday - startOfThen) / dayMs);

  if (diffDays <= 0) {
    return t.saved.today;
  }
  if (diffDays === 1) {
    return t.saved.yesterday;
  }
  if (diffDays < 7) {
    return fmt(t.saved.daysAgo, { count: diffDays });
  }

  // Past a week, show an absolute date in the reader's own conventions —
  // 22/08/2026 in Vietnamese, 08/22/2026 in English, 2026/08/22 in Chinese.
  return new Intl.DateTimeFormat(LOCALE_INFO[locale].htmlLang, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(then);
}

export default function SavedLessons({
  items,
  onSelect,
  onDelete,
}: SavedLessonsProps) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Do not render the dropdown at all when there are no saved lessons.
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border-2 border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-3xl px-6 py-4 text-left"
      >
        <span className="text-sm font-extrabold uppercase tracking-wide text-body transition-colors ease-smooth group-hover:text-black">
          {fmt(t.saved.title, { count: items.length })}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-primary transition ease-smooth group-hover:translate-y-1 group-hover:text-primary-hover ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <ul className="space-y-2 px-4 pb-4">
          {items.map((item) => {
            const isSelected = selectedId === item.videoId;

            return (
            <li
              key={item.videoId}
              className={`flex items-center gap-2 rounded-2xl border-2 p-2 transition ease-smooth ${
                isSelected
                  ? "border-accent bg-[#FFEAD0]"
                  : "border-border bg-background hover:border-accent hover:bg-[#FFF3E6]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  onSelect(item.videoId);
                  setSelectedId(item.videoId);
                  setOpen(false);
                }}
                className="min-w-0 flex-1 cursor-pointer rounded-xl px-3 py-2 text-left"
              >
                <p
                  className={`truncate text-sm text-heading ${
                    isSelected ? "font-extrabold" : "font-bold"
                  }`}
                >
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  {relativeDate(item.savedAt, t, locale)} ·{" "}
                  {fmt(t.saved.vocabCount, { count: item.vocabCount })}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onDelete(item.videoId)}
                aria-label={fmt(t.saved.deleteAria, { title: item.title })}
                title={t.saved.deleteTitle}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-muted transition ease-smooth hover:bg-wrong-light hover:text-wrong"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6h14M10 11v6M14 11v6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
