"use client";

import { cefrChipClass, type CefrLevel } from "@/lib/cefr";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";

/**
 * The CEFR chip, in the two places a level is shown: on the lesson header and
 * on a vocabulary card.
 *
 * The level CODE is always printed — the colour is a second, faster signal, not
 * the signal itself (see the note in globals.css). The plain-language name
 * ("Trung cấp") rides along in the tooltip and the accessible name rather than
 * on the chip, so the chip stays the same width whatever the language.
 */

interface CefrBadgeProps {
  level: CefrLevel | undefined;
  /**
   * "lesson" is the header chip: it carries a "Level" caption and stays
   * visible as "—" when a lesson has no level (every lesson saved before this
   * feature shipped). "word" is the small chip on a vocabulary card, which
   * simply isn't rendered when the word has no level — a column of dashes
   * across old cards would be noise, not information.
   */
  variant?: "lesson" | "word";
  className?: string;
}

export default function CefrBadge({
  level,
  variant = "word",
  className = "",
}: CefrBadgeProps) {
  const { t } = useI18n();

  if (!level && variant === "word") {
    return null;
  }

  const levelName = level ? t.cefr.names[level] : undefined;
  // Tooltip and accessible name say "B1 — Trung cấp"; unlabelled lessons say
  // why they have no level instead of leaving a bare dash to be guessed at.
  const description = level ? `${level} — ${levelName}` : t.cefr.unknownTitle;

  const chip = (
    <span
      className={`${cefrChipClass(level)} inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase leading-none tracking-wide ${
        variant === "lesson" ? "sm:text-xs sm:py-1" : ""
      }`}
      title={description}
      aria-label={fmt(
        variant === "lesson" ? t.cefr.lessonAria : t.cefr.wordAria,
        { level: description },
      )}
    >
      {level ?? t.cefr.unknown}
    </span>
  );

  if (variant === "word") {
    return <span className={className}>{chip}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
        {t.cefr.lessonLabel}
      </span>
      {chip}
    </span>
  );
}
