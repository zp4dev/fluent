"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import CefrBadge from "@/components/lesson/CefrBadge";
import SaveWordButton from "@/components/notebook/SaveWordButton";
import SpeakButton from "@/components/SpeakButton";
import { CHECKOUT_URL } from "@/lib/checkout";
import { useI18n } from "@/lib/i18n/context";
import { rich } from "@/lib/i18n/format";
import type { VocabularyItem } from "@/types/lesson";

const STAGGER_MS = 150;

// A card "has depth" when any of the Pro-only fields are populated.
function itemHasDepth(item: VocabularyItem): boolean {
  return (
    (Array.isArray(item.meanings) && item.meanings.length > 0) ||
    (Array.isArray(item.collocations) && item.collocations.length > 0) ||
    (Array.isArray(item.wordFamily) && item.wordFamily.length > 0)
  );
}

interface VocabularyCardsProps {
  items: VocabularyItem[];
  onReview?: (word: string) => void;
  isPro?: boolean;
  /** Stored with a saved word so its lesson can be found again. */
  videoId?: string;
}

interface VocabularyCardProps {
  item: VocabularyItem;
  isFlipped: boolean;
  extrasOpen: boolean;
  isPreview: boolean;
  videoId?: string;
  onSelect: () => void;
  onToggleExtras: () => void;
}

function VocabularyCard({
  item,
  isFlipped,
  extrasOpen,
  isPreview,
  videoId,
  onSelect,
  onToggleExtras,
}: VocabularyCardProps) {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  // Whether the back-face content overflows below the current scroll position
  // (i.e. there's more to see). Drives the bottom fade + chevron.
  const [showBottomFade, setShowBottomFade] = useState(false);

  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const overflows = el.scrollHeight > el.clientHeight + 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setShowBottomFade(overflows && !atBottom);
  }, []);

  // Recompute when content height can change (flip / extras toggle).
  useEffect(() => {
    updateFade();
  }, [updateFade, extrasOpen, isFlipped]);

  // Recompute when the scroll area resizes (fonts load, viewport changes).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return;
    }
    const observer = new ResizeObserver(() => updateFade());
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateFade]);

  // Defensive defaults so older/partial data never crashes the card.
  const meanings = Array.isArray(item.meanings) ? item.meanings : [];
  const collocations = Array.isArray(item.collocations)
    ? item.collocations
    : [];
  const wordFamily = Array.isArray(item.wordFamily) ? item.wordFamily : [];
  const hasExtras = collocations.length > 0 || wordFamily.length > 0;

  // Pro-preview tag, positioned identically (top-right) on both card faces.
  // Deep-amber pill so the yellow ✨ stays clearly visible.
  const previewTag = isPreview ? (
    <span className="absolute right-3 top-3 z-10 whitespace-nowrap rounded-full bg-[#F2555A] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#FFFFFF] shadow-sm">
      {t.vocabulary.proTag}
    </span>
  ) : null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="flip-scene w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-pressed={isFlipped}
    >
      <div className={`flip-inner ${isFlipped ? "is-flipped" : ""}`}>
        {/* FRONT */}
        <div className="flip-face flex flex-col items-center justify-center rounded-2xl border-2 border-border bg-card p-6 shadow-sm">
          {previewTag}
          {/* Top-LEFT so it never collides with the Pro tag opposite it. The
              level is readable before the card is flipped on purpose: it lets
              a learner skip a word that is far above them. */}
          <CefrBadge level={item.cefr} className="absolute left-3 top-3 z-10" />
          <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-primary">
            {t.vocabulary.tapToReveal}
          </span>
          <div className="mt-2 flex w-full items-center justify-center gap-2">
            <p className="line-clamp-3 break-words text-center text-xl font-bold leading-snug text-heading sm:text-2xl">
              {item.word}
            </p>
            <SpeakButton text={item.word} />
          </div>
          {item.partOfSpeech ? (
            <span className="mt-1 text-xs font-semibold italic text-muted">
              {item.partOfSpeech}
            </span>
          ) : null}
        </div>

        {/* BACK */}
        <div className="flip-face flip-back flex flex-col rounded-2xl border-2 border-border bg-highlight p-5 shadow-sm">
          {previewTag}
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              ref={scrollRef}
              onScroll={updateFade}
              className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
            >
              {/* Header: word + part of speech */}
              <div className={`shrink-0 ${isPreview ? "pr-12" : ""}`}>
                <div className="flex items-center gap-2">
                  <p className="break-words text-base font-bold leading-snug text-heading">
                    {item.word}
                  </p>
                  <SpeakButton text={item.word} />
                  {/* On the back face only: a word is worth keeping once you
                      have seen what it means. */}
                  <SaveWordButton item={item} videoId={videoId} />
                </div>
                {item.partOfSpeech || item.cefr ? (
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    {item.partOfSpeech ? (
                      <p className="text-xs font-semibold italic text-muted">
                        {item.partOfSpeech}
                      </p>
                    ) : null}
                    {/* Inline here rather than pinned to the corner: the back
                        face scrolls, and an absolute chip would sit on top of
                        the text sliding under it. */}
                    <CefrBadge level={item.cefr} />
                  </div>
                ) : null}
              </div>

              {/* Core (available to all users): translation + definitions */}
              <div className="shrink-0 space-y-1">
                <p className="break-words text-sm font-bold leading-5 text-translation">
                  {item.vietnamese}
                </p>
                {item.definitionEn ? (
                  <p className="break-words text-sm leading-5 text-body">
                    {item.definitionEn}
                  </p>
                ) : null}
                {item.definitionVi ? (
                  <p className="break-words text-xs leading-5 text-muted">
                    {item.definitionVi}
                  </p>
                ) : null}
              </div>

              {/* DEPTH FIELD (paid-tier candidate): meanings + examples */}
              {meanings.length > 0 ? (
                <div className="shrink-0 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">
                    {t.vocabulary.meaningsAndExamples}
                  </p>
                  {meanings.map((meaning, index) => (
                    <div
                      key={`${item.word}-meaning-${index}`}
                      className="space-y-1 rounded-xl bg-card p-3"
                    >
                      {meaning.definition ? (
                        <p className="break-words text-xs font-semibold leading-5 text-heading">
                          {meaning.definition}
                        </p>
                      ) : null}
                      {meaning.example ? (
                        <div className="flex items-start gap-1.5">
                          <p className="flex-1 break-words text-xs italic leading-5 text-heading">
                            “{meaning.example}”
                          </p>
                          <SpeakButton text={meaning.example} size={14} />
                        </div>
                      ) : null}
                      {meaning.vietnamese ? (
                        <p className="break-words text-xs leading-5 text-translation">
                          {meaning.vietnamese}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* DEPTH FIELDS (paid-tier candidates): collocations + word
                  family, collapsed by default to keep cards readable. */}
              {hasExtras ? (
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleExtras();
                    }}
                    aria-expanded={extrasOpen}
                    className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-primary transition ease-smooth hover:text-primary-hover"
                  >
                    {extrasOpen ? t.common.showLess : t.common.showMore}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                      className={`transition-transform ease-smooth ${
                        extrasOpen ? "rotate-180" : ""
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

                  {extrasOpen ? (
                    <div className="mt-2 space-y-3">
                      {collocations.length > 0 ? (
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">
                            {t.vocabulary.collocations}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {collocations.map((collocation, index) => (
                              <span
                                key={`${item.word}-colloc-${index}`}
                                className="rounded-lg bg-card px-2 py-1 text-xs font-semibold text-heading"
                              >
                                {collocation}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {wordFamily.length > 0 ? (
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">
                            {t.vocabulary.wordFamily}
                          </p>
                          <ul className="space-y-0.5">
                            {wordFamily.map((relative, index) => (
                              <li
                                key={`${item.word}-family-${index}`}
                                className="break-words text-xs leading-5 text-heading"
                              >
                                <span className="font-bold">
                                  {relative.word}
                                </span>
                                {relative.partOfSpeech ? (
                                  <span className="text-muted">
                                    {" "}
                                    ({relative.partOfSpeech})
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* Scroll indicator: fades content out at the bottom edge (matching
                the card background) and shows a chevron while more content
                remains below. Hidden once scrolled to the bottom. */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-end justify-center bg-gradient-to-t from-highlight via-highlight/80 to-transparent transition-opacity duration-200 ease-smooth ${
                showBottomFade ? "opacity-100" : "opacity-0"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="mb-0.5 animate-bounce text-primary"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VocabularyCards({
  items,
  onReview,
  isPro = false,
  videoId,
}: VocabularyCardsProps) {
  const { t } = useI18n();
  const [flippedWord, setFlippedWord] = useState<string | null>(null);
  // Which cards have their extra "depth" details (collocations + word family)
  // expanded. Kept separate from the flip state so cards stay scannable.
  const [expandedExtras, setExpandedExtras] = useState<Set<string>>(
    () => new Set(),
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCardClick = useCallback(
    (word: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (flippedWord === word) {
        setFlippedWord(null);
        return;
      }

      onReview?.(word);

      if (flippedWord !== null) {
        setFlippedWord(null);
        timeoutRef.current = setTimeout(() => {
          setFlippedWord(word);
          timeoutRef.current = null;
        }, STAGGER_MS);
        return;
      }

      setFlippedWord(word);
    },
    [flippedWord, onReview],
  );

  const toggleExtras = useCallback((word: string) => {
    setExpandedExtras((current) => {
      const next = new Set(current);
      if (next.has(word)) {
        next.delete(word);
      } else {
        next.add(word);
      }
      return next;
    });
  }, []);

  // In a free-tier lesson exactly one card carries depth (the "Pro preview").
  // When every card has depth it's a Pro lesson, so nothing is a preview.
  const allHaveDepth = items.length > 0 && items.every(itemHasDepth);

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((item) => (
          <VocabularyCard
            key={item.word}
            item={item}
            isFlipped={flippedWord === item.word}
            extrasOpen={expandedExtras.has(item.word)}
            isPreview={!isPro && !allHaveDepth && itemHasDepth(item)}
            videoId={videoId}
            onSelect={() => handleCardClick(item.word)}
            onToggleExtras={() => toggleExtras(item.word)}
          />
        ))}
      </div>

      {/* Single upsell line below the vocabulary section (free users only). */}
      {!isPro ? (
        <p className="mt-6 text-center text-sm leading-6 text-body sm:text-left">
          {rich(t.vocabulary.upsell, {
            everyWord: (
              <span className="font-bold">{t.vocabulary.upsellEveryWord}</span>
            ),
            cta: (
              <Link
                href={CHECKOUT_URL}
                className="font-bold text-primary underline-offset-2 transition ease-smooth hover:text-primary-hover hover:underline"
              >
                {t.vocabulary.upsellCta}
              </Link>
            ),
          })}
        </p>
      ) : null}
    </div>
  );
}
