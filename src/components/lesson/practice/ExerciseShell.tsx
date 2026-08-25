"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";

/**
 * The frame every practice format shares: a progress bar, the card, and the
 * end-of-round score screen. Each format supplies only its own question UI, so
 * fill-in-the-blank and dictation can't drift apart visually.
 */

interface ExerciseShellProps {
  current: number; // zero-based
  total: number;
  /** Counts as "answered" for the progress bar. */
  answered: boolean;
  children: ReactNode;
  /** Footer slot: check button, feedback, continue button. */
  footer?: ReactNode;
}

export function ExerciseShell({
  current,
  total,
  answered,
  children,
  footer,
}: ExerciseShellProps) {
  const { t } = useI18n();
  const progress = ((current + (answered ? 1 : 0)) / Math.max(total, 1)) * 100;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm font-bold text-body">
          <span>
            {fmt(t.practice.progress, { current: current + 1, total })}
          </span>
          <span>
            {current + 1}/{total}
          </span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-gradient-accent transition-all duration-500 ease-smooth"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
        {children}
        {footer ? <div className="mt-6 space-y-4">{footer}</div> : null}
      </div>
    </div>
  );
}

interface ExerciseResultProps {
  score: number;
  total: number;
  onRetry: () => void;
  onBack: () => void;
}

export function ExerciseResult({
  score,
  total,
  onRetry,
  onBack,
}: ExerciseResultProps) {
  const { t } = useI18n();
  const perfect = total > 0 && score === total;

  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-border bg-card p-6 py-14 text-center shadow-sm">
      <p className="text-5xl">{perfect ? "🏆" : "🎉"}</p>
      <h3 className="mt-6 text-3xl font-extrabold text-heading">
        {fmt(t.practice.score, { score, total })}
      </h3>
      <p className="mt-3 text-base text-body">
        {perfect
          ? t.practice.scorePerfect
          : score >= total / 2
            ? t.practice.scoreGood
            : t.practice.scorePoor}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 cursor-pointer rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_#CA2851] transition ease-smooth hover:bg-primary-hover active:translate-y-0.5 active:shadow-[0_2px_0_#CA2851]"
      >
        {t.practice.retry}
      </button>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 cursor-pointer text-sm font-bold text-primary transition ease-smooth hover:text-primary-hover"
      >
        {t.practice.backToFormats}
      </button>
    </div>
  );
}

/** The primary "Check" / "Continue" button, identical across formats. */
export function ExerciseButton({
  onClick,
  disabled = false,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full cursor-pointer rounded-2xl bg-primary px-6 py-4 text-base font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_#CA2851] transition ease-smooth hover:bg-primary-hover active:translate-y-0.5 active:shadow-[0_2px_0_#CA2851] disabled:cursor-default disabled:opacity-40 disabled:shadow-none disabled:hover:bg-primary"
    >
      {children}
    </button>
  );
}

/** Green/red verdict line plus, when wrong, the answer that was expected. */
export function ExerciseFeedback({
  correct,
  answer,
}: {
  correct: boolean;
  answer?: string;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <p
        className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
          correct ? "bg-correct-light text-heading" : "bg-wrong-light text-wrong"
        }`}
      >
        {correct ? t.practice.correct : t.practice.incorrect}
      </p>
      {!correct && answer ? (
        <p className="text-sm font-bold leading-6 text-heading">
          {fmt(t.practice.answerWas, { answer })}
        </p>
      ) : null}
    </div>
  );
}
