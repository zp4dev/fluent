"use client";

import { useState } from "react";

import DictationRunner from "@/components/lesson/practice/DictationRunner";
import FillBlankRunner from "@/components/lesson/practice/FillBlankRunner";
import MatchingRunner from "@/components/lesson/practice/MatchingRunner";
import WordOrderRunner from "@/components/lesson/practice/WordOrderRunner";
import {
  availableExerciseKinds,
  exerciseCount,
  type ExerciseKind,
  type LessonExercises,
} from "@/lib/exercises";
import { useI18n } from "@/lib/i18n/context";

interface PracticeSectionProps {
  /**
   * Built once by LessonDisplay, which also needs the counts for the tab
   * badge — rebuilding here would reshuffle every exercise on each mount.
   */
  exercises: LessonExercises;
  /** Fires the first time each format is answered, for the tab badge. */
  onComplete?: (kind: ExerciseKind) => void;
}

const KIND_EMOJI: Record<ExerciseKind, string> = {
  fillBlank: "✍️",
  matching: "🔗",
  dictation: "🎧",
  wordOrder: "🧩",
};

export default function PracticeSection({
  exercises,
  onComplete,
}: PracticeSectionProps) {
  const { t } = useI18n();
  const [active, setActive] = useState<ExerciseKind | null>(null);

  const available = availableExerciseKinds(exercises);

  const labels: Record<ExerciseKind, { name: string; hint: string }> = {
    fillBlank: {
      name: t.practice.kindFillBlank,
      hint: t.practice.kindFillBlankHint,
    },
    matching: {
      name: t.practice.kindMatching,
      hint: t.practice.kindMatchingHint,
    },
    dictation: {
      name: t.practice.kindDictation,
      hint: t.practice.kindDictationHint,
    },
    wordOrder: {
      name: t.practice.kindWordOrder,
      hint: t.practice.kindWordOrderHint,
    },
  };

  if (available.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border bg-highlight p-6 py-16 text-center">
        <p className="text-4xl">🧩</p>
        <p className="mt-4 text-lg font-bold text-heading">
          {t.practice.emptyTitle}
        </p>
        <p className="mt-2 text-sm text-body">{t.practice.emptyBody}</p>
      </div>
    );
  }

  if (active) {
    const back = () => setActive(null);
    const progress = () => onComplete?.(active);

    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={back}
          className="cursor-pointer text-sm font-bold text-primary transition ease-smooth hover:text-primary-hover"
        >
          {t.practice.backToFormats}
        </button>

        {active === "fillBlank" ? (
          <FillBlankRunner
            items={exercises.fillBlank}
            onBack={back}
            onProgress={progress}
          />
        ) : null}

        {active === "matching" ? (
          <MatchingRunner
            rounds={exercises.matching}
            onBack={back}
            onProgress={progress}
          />
        ) : null}

        {active === "dictation" ? (
          <DictationRunner
            items={exercises.dictation}
            onBack={back}
            onProgress={progress}
          />
        ) : null}

        {active === "wordOrder" ? (
          <WordOrderRunner
            items={exercises.wordOrder}
            onBack={back}
            onProgress={progress}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-body">{t.practice.intro}</p>

      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
        {t.practice.pickFormat}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {available.map((kind) => {
          const count = exerciseCount(exercises, kind);

          return (
            <button
              key={kind}
              type="button"
              onClick={() => setActive(kind)}
              className="cursor-pointer rounded-2xl border-2 border-border bg-card p-6 text-left shadow-sm transition ease-smooth hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_6px_0_rgba(202,40,81,0.15)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl">{KIND_EMOJI[kind]}</span>
                <span className="rounded-full bg-highlight px-3 py-1 text-xs font-bold text-primary">
                  {count}
                </span>
              </div>
              <p className="mt-4 text-lg font-extrabold text-heading">
                {labels[kind].name}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-body">
                {labels[kind].hint}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
