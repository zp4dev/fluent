"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import DownloadPdfButton from "@/components/DownloadPdfButton";
import CefrBadge from "@/components/lesson/CefrBadge";
import GrammarSection from "@/components/lesson/GrammarSection";
import IdiomsSection from "@/components/lesson/IdiomsSection";
import QuizSection from "@/components/lesson/QuizSection";
import VocabularyCards from "@/components/lesson/VocabularyCards";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";
import type { Lesson } from "@/types/lesson";

type LessonTab = "vocabulary" | "idioms" | "grammar" | "quiz";

/** Order and emoji are fixed; the labels come from the active dictionary. */
const TAB_ORDER: { id: LessonTab; emoji: string }[] = [
  { id: "vocabulary", emoji: "📚" },
  { id: "idioms", emoji: "💬" },
  { id: "grammar", emoji: "✏️" },
  { id: "quiz", emoji: "🎯" },
];

interface LessonDisplayProps {
  lesson: Lesson;
  videoId: string;
  isPro?: boolean;
}

export default function LessonDisplay({
  lesson,
  videoId,
  isPro = false,
}: LessonDisplayProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<LessonTab>("vocabulary");
  const [reviewedWords, setReviewedWords] = useState<Set<string>>(new Set());
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );
  const [visitedTabs, setVisitedTabs] = useState<Set<LessonTab>>(
    new Set<LessonTab>(["vocabulary"]),
  );

  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [canExpandSummary, setCanExpandSummary] = useState(false);
  const summaryRef = useRef<HTMLParagraphElement>(null);

  const navRef = useRef<HTMLElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFades = useCallback(() => {
    const el = navRef.current;
    if (!el) {
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftFade(scrollLeft > 4);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateFades();
    window.addEventListener("resize", updateFades);
    return () => window.removeEventListener("resize", updateFades);
  }, [updateFades]);

  useEffect(() => {
    const el = summaryRef.current;
    if (el && !summaryExpanded) {
      setCanExpandSummary(el.scrollHeight > el.clientHeight + 1);
    }
  }, [lesson.summary, summaryExpanded]);

  const handleReviewWord = useCallback((word: string) => {
    setReviewedWords((prev) => {
      if (prev.has(word)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(word);
      return next;
    });
  }, []);

  const handleAnswerQuestion = useCallback((index: number) => {
    setAnsweredQuestions((prev) => {
      if (prev.has(index)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  function selectTab(id: LessonTab) {
    setActiveTab(id);
    setVisitedTabs((prev) => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function tabProgress(id: LessonTab): { done: number; total: number } {
    switch (id) {
      case "vocabulary":
        return { done: reviewedWords.size, total: lesson.vocabulary.length };
      case "quiz":
        return { done: answeredQuestions.size, total: lesson.quiz.length };
      case "idioms":
        return {
          done: visitedTabs.has("idioms") ? lesson.idiomsAndSlang.length : 0,
          total: lesson.idiomsAndSlang.length,
        };
      case "grammar":
        return {
          done: visitedTabs.has("grammar") ? lesson.exampleSentences.length : 0,
          total: lesson.exampleSentences.length,
        };
    }
  }

  const tabLabels: Record<LessonTab, string> = {
    vocabulary: t.lesson.tabVocabulary,
    idioms: t.lesson.tabIdioms,
    grammar: t.lesson.tabGrammar,
    quiz: t.lesson.tabQuiz,
  };

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full shrink-0 overflow-hidden rounded-2xl border-2 border-border sm:w-52"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={fmt(t.lesson.thumbnailAlt, { title: lesson.title })}
              className="aspect-video w-full object-cover transition ease-smooth group-hover:scale-105"
              loading="lazy"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition ease-smooth group-hover:opacity-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7L8 5z" fill="#CA2851" />
                </svg>
              </span>
            </span>
          </a>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 sm:justify-start">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#999]">
                {t.lesson.ready}
              </p>
              {/* Always rendered, even with no level: the lesson header is
                  where a learner looks to decide whether the video is for
                  them, so an honest "—" beats a chip that comes and goes. */}
              <CefrBadge level={lesson.level} variant="lesson" />
            </div>
            <h2 className="text-3xl font-extrabold leading-tight text-heading">
              {lesson.title}
            </h2>

            <div>
              <p
                ref={summaryRef}
                className={`max-w-2xl text-base leading-7 text-body ${
                  summaryExpanded ? "" : "line-clamp-2"
                }`}
              >
                {lesson.summary}
              </p>
              {canExpandSummary || summaryExpanded ? (
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((value) => !value)}
                  className="mt-1 cursor-pointer text-sm font-bold text-primary transition ease-smooth hover:text-primary-hover"
                >
                  {summaryExpanded ? t.common.showLess : t.common.showMore}
                </button>
              ) : null}

              {/* Why the video is that level. Never clamped: it is one
                  sentence, and it is the part that makes the chip mean
                  something. */}
              {lesson.levelNote ? (
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  {lesson.levelNote}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                </svg>
                {t.lesson.watchOriginal}
              </a>

              <DownloadPdfButton
                lesson={lesson}
                videoId={videoId}
                isPro={isPro}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="relative -mx-6 mb-4 sm:-mx-8">
        <nav
          ref={navRef}
          onScroll={updateFades}
          aria-label={t.lesson.tabsAria}
          className="flex gap-2.5 overflow-x-auto px-6 pb-7 pt-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-8"
        >
          {TAB_ORDER.map((tab) => {
          const isActive = activeTab === tab.id;
          const { done, total } = tabProgress(tab.id);
          const isComplete = total > 0 && done >= total;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`flex shrink-0 cursor-pointer items-center rounded-full border-2 px-3 py-2.5 text-xs font-extrabold transition ease-smooth sm:px-3.5 sm:py-3 sm:text-sm ${
                isActive
                  ? "scale-[1.03] border-primary bg-primary text-white shadow-[0_4px_0_#CA2851,0_8px_18px_rgba(202,40,81,0.3)]"
                  : "border-border bg-tab-inactive text-body hover:border-primary hover:text-primary"
              }`}
            >
              <span className="mr-2">{tab.emoji}</span>
              {tabLabels[tab.id]}
              {total > 0 ? (
                <span
                  className={`ml-2 inline-flex min-w-[2rem] items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : isComplete
                        ? "bg-correct text-white"
                        : "bg-card text-primary"
                  }`}
                >
                  {isComplete ? "✓" : `${done}/${total}`}
                </span>
              ) : null}
            </button>
          );
          })}
        </nav>

        {showLeftFade ? (
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center bg-gradient-to-r from-card via-card/80 to-transparent pl-2 pr-6 text-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : null}

        {showRightFade ? (
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center justify-end bg-gradient-to-l from-card via-card/80 to-transparent pl-6 pr-2 text-primary">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="animate-pulse"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : null}
      </div>

      <div className="min-h-[320px]">
        {activeTab === "vocabulary" ? (
          <VocabularyCards
            items={lesson.vocabulary}
            onReview={handleReviewWord}
            isPro={isPro}
            videoId={videoId}
          />
        ) : null}

        {activeTab === "idioms" ? (
          <IdiomsSection items={lesson.idiomsAndSlang} />
        ) : null}

        {activeTab === "grammar" ? (
          <GrammarSection items={lesson.exampleSentences} />
        ) : null}

        {activeTab === "quiz" ? (
          <QuizSection
            questions={lesson.quiz}
            onAnswer={handleAnswerQuestion}
          />
        ) : null}
      </div>
    </div>
  );
}
