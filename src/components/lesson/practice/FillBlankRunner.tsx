"use client";

import { useState } from "react";

import SpeakButton from "@/components/SpeakButton";
import {
  ExerciseButton,
  ExerciseFeedback,
  ExerciseResult,
  ExerciseShell,
} from "@/components/lesson/practice/ExerciseShell";
import { isAnswerCorrect, type FillBlankExercise } from "@/lib/exercises";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";

interface FillBlankRunnerProps {
  items: FillBlankExercise[];
  onBack: () => void;
  onProgress?: (index: number) => void;
}

export default function FillBlankRunner({
  items,
  onBack,
  onProgress,
}: FillBlankRunnerProps) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = items[index];
  const correct = checked && isAnswerCorrect(value, item.answer);

  function reset() {
    setIndex(0);
    setValue("");
    setChecked(false);
    setHintShown(false);
    setScore(0);
    setFinished(false);
  }

  function handleCheck() {
    if (checked || !value.trim()) {
      return;
    }
    setChecked(true);
    onProgress?.(index);
    // A revealed hint still counts — the learner produced the phrase either
    // way, and penalising the hint just teaches them not to use it.
    if (isAnswerCorrect(value, item.answer)) {
      setScore((current) => current + 1);
    }
  }

  function handleNext() {
    if (index >= items.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((current) => current + 1);
    setValue("");
    setChecked(false);
    setHintShown(false);
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
          {checked ? <ExerciseFeedback correct={correct} answer={item.answer} /> : null}
          <ExerciseButton
            onClick={checked ? handleNext : handleCheck}
            disabled={!checked && !value.trim()}
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
      <p className="text-xl font-extrabold leading-9 text-heading">
        {item.before}
        <span
          className={`mx-1 inline-block min-w-[6rem] rounded-lg border-b-4 px-2 py-0.5 text-center align-baseline ${
            checked
              ? correct
                ? "border-correct bg-correct-light"
                : "border-wrong bg-wrong-light"
              : "border-primary bg-highlight"
          }`}
        >
          {checked ? item.answer : "​"}
        </span>
        {item.after}
      </p>

      {item.vietnamese ? (
        <p className="mt-4 text-sm font-bold leading-6 text-translation">
          {item.vietnamese}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-2">
        <input
          type="text"
          value={value}
          disabled={checked}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (checked) {
                handleNext();
              } else {
                handleCheck();
              }
            }
          }}
          placeholder={t.practice.fillPlaceholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="w-full rounded-2xl border-2 border-border bg-card px-5 py-4 text-base font-bold text-heading outline-none transition ease-smooth placeholder:font-normal placeholder:text-muted focus:border-primary disabled:opacity-60"
        />
        {checked ? <SpeakButton text={item.sentence} size={20} /> : null}
      </div>

      {!checked ? (
        <div className="mt-3">
          {hintShown ? (
            <p className="text-sm font-bold text-primary">
              {fmt(t.practice.fillHintUsed, {
                hint: item.answer.slice(0, 1),
                count: item.answer.replace(/\s/g, "").length,
              })}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setHintShown(true)}
              className="cursor-pointer text-sm font-bold text-primary transition ease-smooth hover:text-primary-hover"
            >
              💡 {t.practice.fillHint}
            </button>
          )}
        </div>
      ) : null}
    </ExerciseShell>
  );
}
