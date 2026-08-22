"use client";

import Link from "next/link";
import { useState } from "react";

import { CHECKOUT_URL } from "@/lib/checkout";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";
import {
  FREE_WORD_LIMIT,
  addWord,
  createNotebook,
  ensureDefaultNotebook,
  findNotebookWithWord,
  removeWord,
  toNotebookWord,
  useNotebooks,
} from "@/lib/notebook";
import { useProStatus } from "@/lib/useProStatus";
import type { VocabularyItem } from "@/types/lesson";

/**
 * The bookmark on a vocabulary card: keep this word, or drop it again.
 *
 * Where the word GOES depends on the plan, and that difference is the whole
 * feature: a free reader has one notebook and never sees a chooser, while a Pro
 * reader who has made several topics is asked which one. Asking someone with a
 * single notebook to pick from a list of one would be a dialog that only ever
 * has one answer, so it only appears from two notebooks up.
 */

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface SaveWordButtonProps {
  item: VocabularyItem;
  videoId?: string;
}

export default function SaveWordButton({ item, videoId }: SaveWordButtonProps) {
  const { t } = useI18n();
  const { isPro, hydrated: proHydrated } = useProStatus();
  const { notebooks, wordCount, hydrated } = useNotebooks();

  const [showPicker, setShowPicker] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [newName, setNewName] = useState("");

  const holder = findNotebookWithWord(notebooks, item.word);
  const isSaved = Boolean(holder);

  function saveInto(notebookId: string) {
    const result = addWord(notebookId, toNotebookWord(item, videoId), {
      isPro,
    });

    setShowPicker(false);

    // The only failure a reader can act on is the free cap; a duplicate or a
    // notebook deleted in another tab just means there is nothing to do.
    if (!result.ok && result.reason === "word-limit") {
      setShowLimit(true);
    }
  }

  function handleClick(event: React.MouseEvent) {
    // The card behind this button flips on click.
    event.stopPropagation();

    if (!hydrated || !proHydrated) {
      return;
    }

    if (isSaved) {
      removeWord(item.word);
      return;
    }

    if (!isPro && wordCount >= FREE_WORD_LIMIT) {
      setShowLimit(true);
      return;
    }

    if (isPro && notebooks.length >= 2) {
      setShowPicker(true);
      return;
    }

    const target = notebooks[0] ?? ensureDefaultNotebook(t.notebook.defaultName);
    saveInto(target.id);
  }

  function handleCreateAndSave() {
    const result = createNotebook(newName, { isPro });

    if (!result.ok) {
      return;
    }

    const created = result.notebooks[result.notebooks.length - 1];
    setNewName("");

    if (created) {
      saveInto(created.id);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isSaved}
        title={isSaved ? t.notebook.savedTitle : t.notebook.saveTitle}
        aria-label={fmt(
          isSaved ? t.notebook.savedAria : t.notebook.saveAria,
          { word: item.word },
        )}
        className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-1 transition ease-smooth ${
          isSaved
            ? "text-primary hover:text-primary-hover"
            : "text-muted hover:text-primary"
        }`}
      >
        <BookmarkIcon filled={isSaved} />
      </button>

      {showPicker ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notebook-picker-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={(event) => {
            event.stopPropagation();
            setShowPicker(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-6 shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="notebook-picker-title"
              className="text-lg font-extrabold text-heading"
            >
              {fmt(t.notebook.pickTitle, { word: item.word })}
            </h2>

            <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {notebooks.map((notebook) => (
                <li key={notebook.id}>
                  <button
                    type="button"
                    onClick={() => saveInto(notebook.id)}
                    className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-border bg-background px-4 py-3 text-left transition ease-smooth hover:border-primary hover:bg-highlight"
                  >
                    <span className="truncate text-sm font-bold text-heading">
                      {notebook.name}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-muted">
                      {fmt(t.notebook.wordCount, {
                        count: notebook.words.length,
                      })}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleCreateAndSave();
                  }
                }}
                placeholder={t.notebook.newNamePlaceholder}
                className="min-w-0 flex-1 rounded-2xl border-2 border-border bg-background px-4 py-2.5 text-sm font-semibold text-heading outline-none transition ease-smooth focus:border-primary"
              />
              <button
                type="button"
                onClick={handleCreateAndSave}
                disabled={!newName.trim()}
                className="shrink-0 cursor-pointer rounded-2xl bg-primary px-4 py-2.5 text-sm font-extrabold text-white transition ease-smooth hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.notebook.createCta}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="mt-4 block w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-body"
            >
              {t.notebook.cancel}
            </button>
          </div>
        </div>
      ) : null}

      {showLimit ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notebook-limit-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={(event) => {
            event.stopPropagation();
            setShowLimit(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl">📓</p>
            <h2
              id="notebook-limit-title"
              className="mt-4 text-2xl font-extrabold text-heading"
            >
              {t.notebook.limitTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              {fmt(t.notebook.limitBody, { limit: FREE_WORD_LIMIT })}
            </p>
            <Link
              href={CHECKOUT_URL}
              className="btn-3d mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              {t.notebook.limitCta}
            </Link>
            <button
              type="button"
              onClick={() => setShowLimit(false)}
              className="mt-4 block w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-body"
            >
              {t.common.later}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
