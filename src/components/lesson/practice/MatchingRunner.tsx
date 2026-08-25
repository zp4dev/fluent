"use client";

import { useState } from "react";

import { ExerciseButton, ExerciseResult } from "@/components/lesson/practice/ExerciseShell";
import type { MatchingRound } from "@/lib/exercises";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";

interface MatchingRunnerProps {
  rounds: MatchingRound[];
  onBack: () => void;
  onProgress?: (index: number) => void;
}

/**
 * Tap an English word, then tap a meaning. A correct pair locks; a wrong one
 * flashes and clears. The round score is pairs-minus-mistakes so a lucky
 * brute-force run doesn't read as a perfect one.
 */
export default function MatchingRunner({
  rounds,
  onBack,
  onProgress,
}: MatchingRunnerProps) {
  const { t } = useI18n();
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = rounds[roundIndex];
  const isRoundDone = matched.size === round.pairs.length;

  function reset() {
    setRoundIndex(0);
    setSelectedLeft(null);
    setMatched(new Set());
    setWrongPair(null);
    setMistakes(0);
    setScore(0);
    setFinished(false);
  }

  function handleLeft(id: string) {
    if (matched.has(id)) {
      return;
    }
    setWrongPair(null);
    setSelectedLeft((current) => (current === id ? null : id));
  }

  function handleRight(id: string) {
    if (matched.has(id) || selectedLeft === null) {
      return;
    }

    if (selectedLeft === id) {
      setMatched((current) => new Set(current).add(id));
      setSelectedLeft(null);
      setWrongPair(null);
      return;
    }

    setMistakes((current) => current + 1);
    setWrongPair(id);
    setSelectedLeft(null);
  }

  function handleNextRound() {
    onProgress?.(roundIndex);
    // Each pair is a point; every wrong tap gives one back, floored at zero.
    setScore(
      (current) => current + Math.max(round.pairs.length - mistakes, 0),
    );

    if (roundIndex >= rounds.length - 1) {
      setFinished(true);
      return;
    }

    setRoundIndex((current) => current + 1);
    setSelectedLeft(null);
    setMatched(new Set());
    setWrongPair(null);
    setMistakes(0);
  }

  if (finished) {
    const total = rounds.reduce((sum, item) => sum + item.pairs.length, 0);
    return (
      <ExerciseResult
        score={score}
        total={total}
        onRetry={reset}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-body">
        <span>
          {fmt(t.practice.matchingRound, {
            current: roundIndex + 1,
            total: rounds.length,
          })}
        </span>
        <span>
          {fmt(t.practice.matchingRemaining, {
            count: round.pairs.length - matched.size,
          })}
        </span>
      </div>

      <p className="text-sm text-body">{t.practice.matchingIntro}</p>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ul className="space-y-3">
          {round.pairs.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isSelected = selectedLeft === pair.id;

            return (
              <li key={`left-${pair.id}`}>
                <button
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleLeft(pair.id)}
                  className={`h-full w-full cursor-pointer rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition ease-smooth disabled:cursor-default sm:px-4 sm:text-base ${
                    isMatched
                      ? "border-correct bg-correct-light text-heading opacity-70"
                      : isSelected
                        ? "border-primary bg-highlight text-primary"
                        : "border-border bg-card text-heading hover:border-primary hover:bg-highlight"
                  }`}
                >
                  {pair.left}
                  {isMatched ? <span className="ml-1">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>

        <ul className="space-y-3">
          {round.shuffledRight.map((pair) => {
            const isMatched = matched.has(pair.id);
            const isWrong = wrongPair === pair.id;

            return (
              <li key={`right-${pair.id}`}>
                <button
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleRight(pair.id)}
                  className={`h-full w-full cursor-pointer rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition ease-smooth disabled:cursor-default sm:px-4 sm:text-base ${
                    isMatched
                      ? "border-correct bg-correct-light text-heading opacity-70"
                      : isWrong
                        ? "animate-celebrate border-wrong bg-wrong-light text-wrong"
                        : "border-border bg-card text-translation hover:border-primary hover:bg-highlight"
                  }`}
                >
                  {pair.right}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {mistakes > 0 ? (
        <p className="text-sm font-bold text-wrong">
          {fmt(t.practice.matchingMistakes, { count: mistakes })}
        </p>
      ) : null}

      {isRoundDone ? (
        <div className="space-y-4">
          <p className="rounded-2xl bg-correct-light px-4 py-3 text-sm font-semibold text-heading">
            {t.practice.matchingDone}
          </p>
          <ExerciseButton onClick={handleNextRound}>
            {roundIndex >= rounds.length - 1
              ? t.practice.finish
              : t.practice.next}
          </ExerciseButton>
        </div>
      ) : null}
    </div>
  );
}
