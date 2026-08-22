"use client";

import { useMemo } from "react";

import {
  readLocalStorage,
  useHydrated,
  useLocalStorageValue,
  writeLocalStorage,
} from "@/lib/browserStore";
import type { CefrLevel } from "@/lib/cefr";
import { normalizeCefr } from "@/lib/cefr";
import type { VocabularyItem } from "@/types/lesson";

/**
 * The vocabulary notebook: words a learner keeps out of the lessons they read.
 *
 * localStorage only, and every access to it lives in this module so the UI
 * never touches storage directly — same arrangement as lib/savedLessons.ts, and
 * for the same reason: this can become a server-backed store later without any
 * component changing.
 *
 * Reads and writes go through lib/browserStore rather than `window.localStorage`
 * so that a write in the vocabulary card immediately wakes the notebook page,
 * and so another tab's changes are picked up. Nothing here polls.
 *
 * ON THE FREE LIMITS: a product boundary, not a security one. The data is in
 * the visitor's own browser and anyone can edit it from devtools. Enforcing it
 * here keeps the app honest about what it offers; it does not, and cannot,
 * make the limit unbreakable.
 */

const STORAGE_KEY = "fluent-notebooks";

/**
 * Bump when the stored shape changes. Unlike saved lessons, a mismatch here
 * does NOT discard anything: a notebook is words a person chose to keep by
 * hand, so an unreadable store is left untouched rather than cleaned up.
 */
export const NOTEBOOK_SCHEMA_VERSION = 1;

/** Free plan: one notebook, eight words in total. */
export const FREE_WORD_LIMIT = 8;
export const FREE_NOTEBOOK_LIMIT = 1;

export interface NotebookWord {
  /** The word itself — unique within a notebook, compared case-insensitively. */
  word: string;
  partOfSpeech?: string;
  cefr?: CefrLevel;
  definitionEn?: string;
  definitionVi?: string;
  vietnamese?: string;
  /** Where it was learned, so the lesson can be found again. */
  videoId?: string;
  addedAt: number;
}

export interface Notebook {
  id: string;
  name: string;
  createdAt: number;
  words: NotebookWord[];
}

interface NotebookStore {
  version: number;
  notebooks: Notebook[];
}

const EMPTY: Notebook[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `nb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Parse the stored JSON. Anything unreadable reads as "no notebooks yet". */
export function parseNotebooks(raw: string | null): Notebook[] {
  if (!raw) {
    return EMPTY;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<NotebookStore>;

    if (!parsed || !Array.isArray(parsed.notebooks)) {
      return EMPTY;
    }

    return parsed.notebooks
      .filter(
        (notebook): notebook is Notebook =>
          !!notebook &&
          typeof notebook === "object" &&
          typeof notebook.id === "string" &&
          typeof notebook.name === "string" &&
          Array.isArray(notebook.words),
      )
      .map((notebook) => ({
        ...notebook,
        createdAt:
          typeof notebook.createdAt === "number" ? notebook.createdAt : 0,
        words: notebook.words.filter(
          (entry): entry is NotebookWord =>
            !!entry && typeof entry === "object" && typeof entry.word === "string",
        ),
      }));
  } catch {
    return EMPTY;
  }
}

export function readNotebooks(): Notebook[] {
  if (!isBrowser()) {
    return EMPTY;
  }
  return parseNotebooks(readLocalStorage(STORAGE_KEY));
}

function writeNotebooks(notebooks: Notebook[]): Notebook[] {
  if (!isBrowser()) {
    return notebooks;
  }

  const store: NotebookStore = {
    version: NOTEBOOK_SCHEMA_VERSION,
    notebooks,
  };

  writeLocalStorage(STORAGE_KEY, JSON.stringify(store));
  return notebooks;
}

/** Words across every notebook — what the free limit counts. */
export function countWords(notebooks: Notebook[]): number {
  return notebooks.reduce((total, notebook) => total + notebook.words.length, 0);
}

const sameWord = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/** Which notebook holds this word, if any. */
export function findNotebookWithWord(
  notebooks: Notebook[],
  word: string,
): Notebook | null {
  return (
    notebooks.find((notebook) =>
      notebook.words.some((entry) => sameWord(entry.word, word)),
    ) ?? null
  );
}

export type NotebookFailure =
  /** Free plan, eight words already kept. */
  | "word-limit"
  /** Free plan, one notebook already exists. */
  | "notebook-limit"
  /** The word is already in one of the notebooks. */
  | "duplicate"
  /** The target notebook id no longer exists. */
  | "missing-notebook"
  /** A notebook needs a name. */
  | "empty-name";

export type NotebookResult =
  | { ok: true; notebooks: Notebook[] }
  | { ok: false; reason: NotebookFailure };

interface PlanOptions {
  isPro: boolean;
}

/**
 * The single notebook a free user writes into, created on demand.
 *
 * Named by the caller because the name is user-facing text and belongs to the
 * dictionary, not to storage.
 */
export function ensureDefaultNotebook(defaultName: string): Notebook {
  const notebooks = readNotebooks();

  if (notebooks[0]) {
    return notebooks[0];
  }

  const notebook: Notebook = {
    id: newId(),
    name: defaultName,
    createdAt: Date.now(),
    words: [],
  };

  writeNotebooks([notebook]);
  return notebook;
}

export function createNotebook(
  name: string,
  { isPro }: PlanOptions,
): NotebookResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { ok: false, reason: "empty-name" };
  }

  const notebooks = readNotebooks();

  // A lapsed Pro account keeps every notebook it made — it simply cannot make
  // another one. Nothing here ever deletes on a downgrade.
  if (!isPro && notebooks.length >= FREE_NOTEBOOK_LIMIT) {
    return { ok: false, reason: "notebook-limit" };
  }

  const notebook: Notebook = {
    id: newId(),
    name: trimmed,
    createdAt: Date.now(),
    words: [],
  };

  return { ok: true, notebooks: writeNotebooks([...notebooks, notebook]) };
}

export function renameNotebook(id: string, name: string): NotebookResult {
  const trimmed = name.trim();

  if (!trimmed) {
    return { ok: false, reason: "empty-name" };
  }

  const notebooks = readNotebooks();

  if (!notebooks.some((notebook) => notebook.id === id)) {
    return { ok: false, reason: "missing-notebook" };
  }

  return {
    ok: true,
    notebooks: writeNotebooks(
      notebooks.map((notebook) =>
        notebook.id === id ? { ...notebook, name: trimmed } : notebook,
      ),
    ),
  };
}

export function deleteNotebook(id: string): Notebook[] {
  return writeNotebooks(
    readNotebooks().filter((notebook) => notebook.id !== id),
  );
}

/** Everything worth keeping about a word, taken from the lesson card. */
export function toNotebookWord(
  item: VocabularyItem,
  videoId?: string,
): NotebookWord {
  return {
    word: item.word,
    partOfSpeech: item.partOfSpeech || undefined,
    cefr: normalizeCefr(item.cefr),
    definitionEn: item.definitionEn || undefined,
    definitionVi: item.definitionVi || undefined,
    vietnamese: item.vietnamese || undefined,
    videoId,
    addedAt: Date.now(),
  };
}

export function addWord(
  notebookId: string,
  word: NotebookWord,
  { isPro }: PlanOptions,
): NotebookResult {
  const notebooks = readNotebooks();

  if (findNotebookWithWord(notebooks, word.word)) {
    return { ok: false, reason: "duplicate" };
  }

  // The cap counts every notebook, so someone who made several while on Pro
  // can't get past eight by spreading them out.
  if (!isPro && countWords(notebooks) >= FREE_WORD_LIMIT) {
    return { ok: false, reason: "word-limit" };
  }

  if (!notebooks.some((notebook) => notebook.id === notebookId)) {
    return { ok: false, reason: "missing-notebook" };
  }

  return {
    ok: true,
    notebooks: writeNotebooks(
      notebooks.map((notebook) =>
        notebook.id === notebookId
          ? { ...notebook, words: [word, ...notebook.words] }
          : notebook,
      ),
    ),
  };
}

/**
 * Remove a word wherever it is.
 *
 * Deliberately not plan-gated: someone over the free limit must always be able
 * to get back under it, and taking a word out is never the thing to charge for.
 */
export function removeWord(word: string): Notebook[] {
  return writeNotebooks(
    readNotebooks().map((notebook) => ({
      ...notebook,
      words: notebook.words.filter((entry) => !sameWord(entry.word, word)),
    })),
  );
}

/** Replace the whole store — used by the backup import. */
export function replaceNotebooks(notebooks: Notebook[]): Notebook[] {
  return writeNotebooks(notebooks);
}

export interface NotebookState {
  notebooks: Notebook[];
  wordCount: number;
  /** False until after hydration, so the UI can hold back browser-only text. */
  hydrated: boolean;
}

/**
 * Live view of the notebooks.
 *
 * Every component that shows them uses this, so a word saved from a vocabulary
 * card appears on the notebook page without either of them knowing about the
 * other — browserStore notifies both.
 */
export function useNotebooks(): NotebookState {
  const raw = useLocalStorageValue(STORAGE_KEY);
  const hydrated = useHydrated();
  const notebooks = useMemo(() => parseNotebooks(raw), [raw]);

  return {
    notebooks,
    wordCount: countWords(notebooks),
    hydrated,
  };
}
