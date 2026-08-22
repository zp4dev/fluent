"use client";

import Link from "next/link";
import { useState } from "react";

import CefrBadge from "@/components/lesson/CefrBadge";
import NotebookBackup from "@/components/notebook/NotebookBackup";
import SpeakButton from "@/components/SpeakButton";
import { CHECKOUT_URL } from "@/lib/checkout";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";
import {
  FREE_NOTEBOOK_LIMIT,
  FREE_WORD_LIMIT,
  createNotebook,
  deleteNotebook,
  removeWord,
  renameNotebook,
  useNotebooks,
} from "@/lib/notebook";
import { useProStatus } from "@/lib/useProStatus";

/**
 * The notebook page: everything a reader has kept, grouped by topic.
 *
 * Free and Pro see the same page — the difference is what the controls do.
 * Nothing is ever hidden from a free reader, and nothing is deleted when a Pro
 * plan lapses: the notebooks stay, they simply stop growing.
 */
export default function NotebookManager() {
  const { t } = useI18n();
  const { isPro, hydrated: proHydrated } = useProStatus();
  const { notebooks, wordCount, hydrated } = useNotebooks();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showNotebookLimit, setShowNotebookLimit] = useState(false);

  // The selection is DERIVED, not synchronised: `selectedId` is only a hint,
  // and a stale one (a notebook deleted here, or in another tab) simply falls
  // back to the first notebook. Keeping the two in step with an effect would
  // mean a second render after every change for no benefit.
  const selected =
    notebooks.find((notebook) => notebook.id === selectedId) ?? notebooks[0];

  function handleCreate() {
    if (!isPro && notebooks.length >= FREE_NOTEBOOK_LIMIT) {
      setCreating(false);
      setShowNotebookLimit(true);
      return;
    }

    const result = createNotebook(newName, { isPro });

    if (!result.ok) {
      if (result.reason === "notebook-limit") {
        setShowNotebookLimit(true);
      }
      return;
    }

    const created = result.notebooks[result.notebooks.length - 1];
    setNewName("");
    setCreating(false);

    if (created) {
      setSelectedId(created.id);
    }
  }

  function handleRename(id: string) {
    renameNotebook(id, renameValue);
    setRenamingId(null);
    setRenameValue("");
  }

  const statusLine = !hydrated || !proHydrated
    ? ""
    : isPro
      ? fmt(t.notebook.statusPro, {
          words: wordCount,
          notebooks: notebooks.length,
        })
      : fmt(t.notebook.statusFree, {
          words: wordCount,
          limit: FREE_WORD_LIMIT,
        });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-6 py-10 sm:px-8">
      <header className="space-y-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary transition ease-smooth hover:text-primary-hover"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t.notebook.backToLessons}
        </Link>

        <h1 className="text-3xl font-extrabold leading-tight text-heading">
          {t.notebook.pageTitle}
        </h1>
        <p className="text-base leading-7 text-body">{t.notebook.pageIntro}</p>

        {statusLine ? (
          <p className="text-sm font-bold text-muted">{statusLine}</p>
        ) : null}

        {hydrated && proHydrated && !isPro && wordCount >= FREE_WORD_LIMIT ? (
          <p className="rounded-2xl border-2 border-border bg-highlight px-5 py-4 text-sm font-bold leading-6 text-heading">
            {fmt(t.notebook.limitBody, { limit: FREE_WORD_LIMIT })}{" "}
            <Link
              href={CHECKOUT_URL}
              className="text-primary underline-offset-2 hover:underline"
            >
              {t.notebook.limitCta}
            </Link>
          </p>
        ) : null}
      </header>

      {/* Notebook switcher. A free reader has exactly one, so the row is just
          a label for them — the create control still shows, because that is
          where the Pro difference is explained. */}
      <div className="flex flex-wrap items-center gap-2">
        {notebooks.map((notebook) => {
          const isActive = notebook.id === selected?.id;

          return (
            <button
              key={notebook.id}
              type="button"
              onClick={() => setSelectedId(notebook.id)}
              className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-extrabold transition ease-smooth ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-body hover:border-primary hover:text-primary"
              }`}
            >
              {notebook.name}
              <span
                className={`ml-2 text-xs font-bold ${
                  isActive ? "text-white/80" : "text-muted"
                }`}
              >
                {notebook.words.length}
              </span>
            </button>
          );
        })}

        {creating ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCreate();
                }
                if (event.key === "Escape") {
                  setCreating(false);
                  setNewName("");
                }
              }}
              placeholder={t.notebook.newNamePlaceholder}
              className="w-44 rounded-full border-2 border-border bg-background px-4 py-2 text-sm font-semibold text-heading outline-none transition ease-smooth focus:border-primary"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="cursor-pointer rounded-full bg-primary px-4 py-2 text-sm font-extrabold text-white transition ease-smooth hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.notebook.createCta}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!isPro && notebooks.length >= FREE_NOTEBOOK_LIMIT) {
                setShowNotebookLimit(true);
                return;
              }
              setCreating(true);
            }}
            className="cursor-pointer rounded-full border-2 border-dashed border-border px-4 py-2 text-sm font-bold text-muted transition ease-smooth hover:border-primary hover:text-primary"
          >
            + {t.notebook.newNotebookCta}
          </button>
        )}
      </div>

      {/* The selected notebook */}
      {selected ? (
        <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {renamingId === selected.id ? (
              <div className="flex flex-1 gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(event) => setRenameValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleRename(selected.id);
                    }
                    if (event.key === "Escape") {
                      setRenamingId(null);
                    }
                  }}
                  className="min-w-0 flex-1 rounded-2xl border-2 border-border bg-background px-4 py-2 text-sm font-bold text-heading outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => handleRename(selected.id)}
                  className="cursor-pointer rounded-2xl bg-primary px-4 py-2 text-sm font-extrabold text-white hover:bg-primary-hover"
                >
                  {t.notebook.saveNameCta}
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-extrabold text-heading">
                  {selected.name}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRenamingId(selected.id);
                      setRenameValue(selected.name);
                    }}
                    className="cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-primary"
                  >
                    {t.notebook.renameCta}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(selected.id)}
                    className="cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-wrong"
                  >
                    {t.notebook.deleteCta}
                  </button>
                </div>
              </>
            )}
          </div>

          {selected.words.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-4xl">📓</p>
              <p className="mt-3 text-base font-bold text-heading">
                {t.notebook.emptyTitle}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {t.notebook.emptyBody}
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {selected.words.map((entry) => (
                <li
                  key={entry.word}
                  className="flex items-start gap-3 rounded-2xl border-2 border-border bg-background p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="break-words text-base font-bold text-heading">
                        {entry.word}
                      </p>
                      <SpeakButton text={entry.word} size={14} />
                      <CefrBadge level={entry.cefr} />
                      {entry.partOfSpeech ? (
                        <span className="text-xs font-semibold italic text-muted">
                          {entry.partOfSpeech}
                        </span>
                      ) : null}
                    </div>
                    {entry.vietnamese ? (
                      <p className="mt-1 break-words text-sm font-bold text-translation">
                        {entry.vietnamese}
                      </p>
                    ) : null}
                    {entry.definitionEn ? (
                      <p className="mt-0.5 break-words text-sm leading-5 text-body">
                        {entry.definitionEn}
                      </p>
                    ) : null}
                    {entry.videoId ? (
                      <a
                        href={`https://www.youtube.com/watch?v=${entry.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs font-bold text-primary underline-offset-2 hover:underline"
                      >
                        {t.notebook.sourceVideo}
                      </a>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeWord(entry.word)}
                    aria-label={fmt(t.notebook.removeAria, {
                      word: entry.word,
                    })}
                    title={t.notebook.removeTitle}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-2 text-muted transition ease-smooth hover:bg-wrong-light hover:text-wrong"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6h14M10 11v6M14 11v6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border-2 border-border bg-card p-10 text-center shadow-sm">
          <p className="text-4xl">📓</p>
          <p className="mt-3 text-base font-bold text-heading">
            {t.notebook.emptyTitle}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {t.notebook.emptyBody}
          </p>
        </section>
      )}

      <NotebookBackup isPro={isPro} hydrated={proHydrated} />

      {confirmDeleteId ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notebook-delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="notebook-delete-title"
              className="text-xl font-extrabold text-heading"
            >
              {t.notebook.deleteTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              {fmt(t.notebook.deleteBody, {
                name:
                  notebooks.find((notebook) => notebook.id === confirmDeleteId)
                    ?.name ?? "",
              })}
            </p>
            <button
              type="button"
              onClick={() => {
                deleteNotebook(confirmDeleteId);
                setConfirmDeleteId(null);
              }}
              className="btn-3d mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-wrong px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white"
            >
              {t.notebook.deleteConfirmCta}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="mt-4 block w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-body"
            >
              {t.notebook.cancel}
            </button>
          </div>
        </div>
      ) : null}

      {showNotebookLimit ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notebook-count-limit-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setShowNotebookLimit(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl">🗂️</p>
            <h2
              id="notebook-count-limit-title"
              className="mt-4 text-2xl font-extrabold text-heading"
            >
              {t.notebook.notebookLimitTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              {t.notebook.notebookLimitBody}
            </p>
            <Link
              href={CHECKOUT_URL}
              className="btn-3d mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              {t.notebook.limitCta}
            </Link>
            <button
              type="button"
              onClick={() => setShowNotebookLimit(false)}
              className="mt-4 block w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-body"
            >
              {t.common.later}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
