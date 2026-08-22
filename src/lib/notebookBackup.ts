"use client";

import { normalizeCefr } from "@/lib/cefr";
import {
  NOTEBOOK_SCHEMA_VERSION,
  type Notebook,
  type NotebookWord,
} from "@/lib/notebook";

/**
 * Backup file format for notebooks (Pro).
 *
 * Separate from lib/lessonBackup.ts even though the two look alike: they carry
 * different data, version independently, and a file of one kind must never be
 * accepted as the other. The two `kind` values are what keeps them apart.
 *
 * As with lessons, everything read here is UNTRUSTED — the file comes off the
 * visitor's disk and may be hand-edited or truncated. Every field is checked
 * rather than cast, and anything that fails is dropped instead of reaching the
 * UI.
 */

export const NOTEBOOK_BACKUP_FORMAT_VERSION = 1;

const BACKUP_APP = "learnfluent";
const BACKUP_KIND = "notebooks";

export interface NotebookBackupFile {
  app: typeof BACKUP_APP;
  kind: typeof BACKUP_KIND;
  formatVersion: number;
  schemaVersion: number;
  exportedAt: string;
  notebooks: Notebook[];
}

export function buildNotebookBackup(notebooks: Notebook[]): NotebookBackupFile {
  return {
    app: BACKUP_APP,
    kind: BACKUP_KIND,
    formatVersion: NOTEBOOK_BACKUP_FORMAT_VERSION,
    schemaVersion: NOTEBOOK_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    notebooks,
  };
}

/** e.g. learnfluent-notebooks-2026-08-23.json */
export function notebookBackupFileName(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `learnfluent-notebooks-${year}-${month}-${day}.json`;
}

export type NotebookBackupError =
  | "invalid-json"
  | "not-a-backup"
  | "wrong-schema"
  | "no-notebooks";

export type NotebookBackupResult =
  | { ok: true; notebooks: Notebook[]; dropped: number }
  | { ok: false; error: NotebookBackupError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readWord(value: unknown): NotebookWord | null {
  if (!isRecord(value)) {
    return null;
  }

  const word = text(value.word);

  if (!word) {
    return null;
  }

  return {
    word,
    partOfSpeech: text(value.partOfSpeech),
    cefr: normalizeCefr(value.cefr),
    definitionEn: text(value.definitionEn),
    definitionVi: text(value.definitionVi),
    vietnamese: text(value.vietnamese),
    videoId: text(value.videoId),
    // A missing or nonsense timestamp becomes "now" rather than 1970, which
    // would lose every merge against words already here.
    addedAt:
      typeof value.addedAt === "number" && Number.isFinite(value.addedAt)
        ? value.addedAt
        : Date.now(),
  };
}

function readNotebook(value: unknown): Notebook | null {
  if (!isRecord(value)) {
    return null;
  }

  const name = text(value.name);
  const id = text(value.id);

  if (!name || !id || !Array.isArray(value.words)) {
    return null;
  }

  const words: NotebookWord[] = [];
  const seen = new Set<string>();

  for (const raw of value.words) {
    const entry = readWord(raw);
    const key = entry?.word.trim().toLowerCase();

    if (entry && key && !seen.has(key)) {
      seen.add(key);
      words.push(entry);
    }
  }

  return {
    id,
    name,
    createdAt:
      typeof value.createdAt === "number" && Number.isFinite(value.createdAt)
        ? value.createdAt
        : Date.now(),
    words,
  };
}

export function parseNotebookBackup(raw: string): NotebookBackupResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid-json" };
  }

  if (
    !isRecord(parsed) ||
    parsed.app !== BACKUP_APP ||
    parsed.kind !== BACKUP_KIND ||
    !Array.isArray(parsed.notebooks)
  ) {
    return { ok: false, error: "not-a-backup" };
  }

  if (
    typeof parsed.schemaVersion === "number" &&
    parsed.schemaVersion !== NOTEBOOK_SCHEMA_VERSION
  ) {
    return { ok: false, error: "wrong-schema" };
  }

  const notebooks: Notebook[] = [];
  let dropped = 0;

  for (const raw2 of parsed.notebooks) {
    const notebook = readNotebook(raw2);

    if (notebook) {
      notebooks.push(notebook);
    } else {
      dropped += 1;
    }
  }

  if (notebooks.length === 0) {
    return { ok: false, error: "no-notebooks" };
  }

  return { ok: true, notebooks, dropped };
}

export interface NotebookMergeResult {
  notebooks: Notebook[];
  /** Notebooks that did not exist here before. */
  addedNotebooks: number;
  /** Words added into notebooks that already existed. */
  addedWords: number;
  /** Words already present, left alone. */
  skippedWords: number;
}

/**
 * Merge imported notebooks into the ones already here.
 *
 * MERGE, never replace: an import must not be able to wipe words that exist
 * only in this browser. Notebooks are matched by id; a word already present in
 * the target notebook is left as it is, so re-importing the same file changes
 * nothing.
 */
export function mergeNotebooks(
  current: Notebook[],
  incoming: Notebook[],
): NotebookMergeResult {
  const byId = new Map(current.map((notebook) => [notebook.id, notebook]));
  let addedNotebooks = 0;
  let addedWords = 0;
  let skippedWords = 0;

  for (const notebook of incoming) {
    const existing = byId.get(notebook.id);

    if (!existing) {
      byId.set(notebook.id, notebook);
      addedNotebooks += 1;
      addedWords += notebook.words.length;
      continue;
    }

    const seen = new Set(
      existing.words.map((entry) => entry.word.trim().toLowerCase()),
    );
    const merged = [...existing.words];

    for (const entry of notebook.words) {
      const key = entry.word.trim().toLowerCase();

      if (seen.has(key)) {
        skippedWords += 1;
        continue;
      }

      seen.add(key);
      merged.push(entry);
      addedWords += 1;
    }

    byId.set(notebook.id, {
      ...existing,
      words: merged.sort((a, b) => b.addedAt - a.addedAt),
    });
  }

  return {
    notebooks: [...byId.values()],
    addedNotebooks,
    addedWords,
    skippedWords,
  };
}
