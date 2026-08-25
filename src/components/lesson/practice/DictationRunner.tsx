"use client";

import {
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import {
  ExerciseButton,
  ExerciseFeedback,
  ExerciseResult,
  ExerciseShell,
} from "@/components/lesson/practice/ExerciseShell";
import {
  diffDictation,
  isAnswerCorrect,
  type DictationExercise,
} from "@/lib/exercises";
import { useI18n } from "@/lib/i18n/context";

interface DictationRunnerProps {
  items: DictationExercise[];
  onBack: () => void;
  onProgress?: (index: number) => void;
}

/**
 * Listen, then type it back. Uses the same Web Speech voice as SpeakButton,
 * but needs its own playback because the point of the exercise is replaying —
 * and replaying slowly — which a fixed-rate icon button can't do.
 */
export default function DictationRunner({
  items,
  onBack,
  onProgress,
}: DictationRunnerProps) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = items[index];
  const correct = checked && isAnswerCorrect(value, item.sentence);

  // Read once on the client, with `false` as the server snapshot so the markup
  // matches on hydration. Support never changes mid-session, so there is
  // nothing to subscribe to.
  const canSpeak = useSyncExternalStore(
    () => () => {},
    () => "speechSynthesis" in window,
    () => false,
  );

  const speak = useCallback(
    (rate: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(item.sentence);
      utterance.lang = "en-US";
      utterance.rate = rate;
      synth.speak(utterance);
    },
    [item.sentence],
  );

  // Read the new sentence as soon as it appears — a dictation exercise that
  // waits for a tap before making any sound is just a blank text box.
  useEffect(() => {
    speak(1);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speak]);

  function reset() {
    setIndex(0);
    setValue("");
    setChecked(false);
    setShowClue(false);
    setScore(0);
    setFinished(false);
  }

  function handleCheck() {
    if (checked || !value.trim()) {
      return;
    }
    setChecked(true);
    onProgress?.(index);
    if (isAnswerCorrect(value, item.sentence)) {
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
    setShowClue(false);
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
            <>
              <ExerciseFeedback correct={correct} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  {t.practice.dictationReveal}
                </p>
                <p className="mt-2 text-lg font-bold leading-8 text-heading">
                  {diffDictation(value, item.sentence).map((word, position) => (
                    <span
                      key={`${word.word}-${position}`}
                      className={`mr-1.5 inline-block rounded-md px-1 ${
                        word.correct
                          ? "text-heading"
                          : "bg-wrong-light text-wrong"
                      }`}
                    >
                      {word.word}
                    </span>
                  ))}
                </p>
                {item.vietnamese ? (
                  <p className="mt-2 text-sm font-bold leading-6 text-translation">
                    {item.vietnamese}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
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
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-5xl">🎧</p>

        {canSpeak ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => speak(1)}
              className="cursor-pointer rounded-2xl bg-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_4px_0_#CA2851] transition ease-smooth hover:bg-primary-hover active:translate-y-0.5 active:shadow-[0_2px_0_#CA2851]"
            >
              ▶ {t.practice.dictationPlay}
            </button>
            <button
              type="button"
              onClick={() => speak(0.6)}
              className="cursor-pointer rounded-2xl border-2 border-border bg-card px-6 py-3 text-sm font-extrabold text-primary transition ease-smooth hover:border-primary hover:bg-highlight"
            >
              🐢 {t.practice.dictationSlow}
            </button>
          </div>
        ) : (
          <p className="max-w-md rounded-2xl bg-highlight px-4 py-3 text-center text-sm leading-6 text-body">
            {t.practice.dictationUnsupported}
          </p>
        )}

        {showClue ? (
          <p className="max-w-md text-center text-sm font-bold leading-6 text-translation">
            {item.vietnamese}
          </p>
        ) : item.vietnamese && !checked ? (
          <button
            type="button"
            onClick={() => setShowClue(true)}
            className="cursor-pointer text-sm font-bold text-primary transition ease-smooth hover:text-primary-hover"
          >
            💡 {t.practice.showClue}
          </button>
        ) : null}
      </div>

      <textarea
        value={value}
        disabled={checked}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (checked) {
              handleNext();
            } else {
              handleCheck();
            }
          }
        }}
        placeholder={t.practice.dictationPlaceholder}
        rows={3}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        className="w-full resize-none rounded-2xl border-2 border-border bg-card px-5 py-4 text-base font-bold leading-7 text-heading outline-none transition ease-smooth placeholder:font-normal placeholder:text-muted focus:border-primary disabled:opacity-60"
      />
    </ExerciseShell>
  );
}
