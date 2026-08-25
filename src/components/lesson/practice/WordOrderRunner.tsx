"use client";

import { useState } from "react";

import SpeakButton from "@/components/SpeakButton";
import {
  ExerciseButton,
  ExerciseFeedback,
  ExerciseResult,
  ExerciseShell,
} from "@/components/lesson/practice/ExerciseShell";
import type { WordOrderExercise } from "@/lib/exercises";
import { useI18n } from "@/lib/i18n/context";

interface WordOrderRunnerProps {
  items: WordOrderExercise[];
  onBack: () => void;
  onProgress?: (index: number) => void;
}

/**
 * Tap the shuffled tokens back into a sentence. Tokens are tracked by their
 * position in the shuffled array, never by their text: a sentence like "the
 * more you know, the more you learn" has repeated words, and keying on text
 * would make two chips consume each other's taps.
 */
export default function WordOrderRunner({
  items,
  onBack,
  onProgress,
}: WordOrderRunnerProps) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = items[index];
  const built = placed.map((slot) => item.tokens[slot]).join(" ");
  const correct = checked && built === item.sentence;
  const isComplete = placed.length === item.tokens.length;

  function reset() {
    setIndex(0);
    setPlaced([]);
    setChecked(false);
    setScore(0);
    setFinished(false);
  }

  function handleCheck() {
    if (checked || !isComplete) {
      return;
    }
    setChecked(true);
    onProgress?.(index);
    if (built === item.sentence) {
      setScore((current) => current + 1);
    }
  }

  function handleNext() {
    if (index >= items.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setPlaced([]);
    setChecked(false);
  }

  if (finished) {
    return (
      <ExerciseResult
        score={score}
        total={items.length}
        onRetry={reset}
        onBack={onBack}
      />
    );
  }

  return (
    <ExerciseShell
      current={index}
      total={items.length}
      answered={checked}
      footer={
        <>
          {checked ? (
            <ExerciseFeedback correct={correct} answer={item.sentence} />
          ) : null}
          <ExerciseButton
            onClick={checked ? handleNext : handleCheck}
            disabled={!checked && !isComplete}
          >
            {checked
              ? index >= items.length - 1
                ? t.practice.finish
                : t.practice.next
              : t.practice.check}
          </ExerciseButton>
        </>
      }
    >
      <p className="text-sm text-body">{t.practice.orderIntro}</p>

      {item.vietnamese ? (
        <p className="mt-3 text-sm font-bold leading-6 text-translation">
          {item.vietnamese}
        </p>
      ) : null}

      {/* Answer tray */}
      <div
        className={`mt-5 flex min-h-[5.5rem] flex-wrap content-start gap-2 rounded-2xl border-2 border-dashed p-4 transition ease-smooth ${
          checked
            ? correct
              ? "border-correct bg-correct-light"
              : "border-wrong bg-wrong-light"
            : "border-border bg-highlight"
        }`}
      >
        {placed.length === 0 ? (
          <p className="text-sm text-muted">{t.practice.orderEmpty}</p>
        ) : (
          placed.map((slot, position) => (
            <button
              key={`placed-${slot}`}
              type="button"
              disabled={checked}
              onClick={() =>
                setPlaced((current) =>
                  current.filter((_, at) => at !== position),
                )
              }
              className="cursor-pointer rounded-xl border-2 border-primary bg-card px-3 py-2 text-base font-bold text-heading transition ease-smooth hover:bg-highlight disabled:cursor-default"
            >
              {item.tokens[slot]}
            </button>
          ))
        )}
      </div>

      {/* Word bank */}
      <div className="mt-5 flex flex-wrap gap-2">
        {item.tokens.map((token, slot) => {
          const used = placed.includes(slot);

          return (
            <button
              key={`token-${slot}`}
              type="button"
              disabled={used || checked}
              onClick={() => setPlaced((current) => [...current, slot])}
              className={`rounded-xl border-2 px-3 py-2 text-base font-bold transition ease-smooth ${
                used
                  ? "cursor-default border-border bg-background text-muted opacity-40"
                  : "cursor-pointer border-border bg-card text-heading hover:border-primary hover:bg-highlight disabled:cursor-default"
              }`}
            >
              {token}
            </button>
          );
        })}
      </div>

      {!checked && placed.length > 0 ? (
        <div className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={() => setPlaced((current) => current.slice(0, -1))}
            className="cursor-pointer text-sm font-bold text-primary transition ease-smooth hover:text-primary-hover"
          >
            ↩ {t.practice.orderUndo}
          </button>
          <button
            type="button"
            onClick={() => setPlaced([])}
            className="cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-primary"
          >
            {t.practice.orderClear}
          </button>
        </div>
      ) : null}

      {checked ? (
        <div className="mt-4 flex items-center gap-2">
          <SpeakButton text={item.sentence} size={20} />
          <span className="text-sm font-bold text-body">{item.sentence}</span>
        </div>
      ) : null}
    </ExerciseShell>
  );
}
