"use client";

import { normalizeCefr } from "@/lib/cefr";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";
import {
  SAVED_LESSON_SCHEMA_VERSION,
  type SavedLessonBackupEntry,
} from "@/lib/savedLessons";
import type {
  ExampleSentence,
  IdiomItem,
  Lesson,
  QuizQuestion,
  VocabularyItem,
  VocabularyMeaning,
  WordFamilyEntry,
} from "@/types/lesson";

/**
 * The backup file format for saved lessons (Pro).
 *
 * Split from `lib/savedLessons.ts` on purpose: that module owns localStorage,
 * this one owns the file on disk. Nothing here touches storage, so the shape of
 * the file can change without anybody worrying about what it does to a browser
 * that already has lessons in it.
 *
 * EVERYTHING READ HERE IS UNTRUSTED. The file arrives from the user's disk and
 * can contain anything at all — it may have been hand-edited, truncated, or be
 * an unrelated JSON file with the right extension. Every field is therefore
 * checked rather than cast, and a lesson that does not survive the check is
 * dropped instead of being handed to a component that assumes it is well
 * formed. React escapes text, so the risk here isn't injection — it's a card
 * that crashes the whole page on a missing array.
 */

/** Bumped only when the ENVELOPE changes; the lesson shape has its own version. */
export const BACKUP_FORMAT_VERSION = 1;

const BACKUP_APP = "learnfluent";
const BACKUP_KIND = "saved-lessons";

export interface LessonBackupFile {
  app: typeof BACKUP_APP;
  kind: typeof BACKUP_KIND;
  formatVersion: number;
  /** Lesson schema the payloads were written under. */
  schemaVersion: number;
  exportedAt: string;
  lessons: SavedLessonBackupEntry[];
}

export function buildBackupFile(
  entries: SavedLessonBackupEntry[],
): LessonBackupFile {
  return {
    app: BACKUP_APP,
    kind: BACKUP_KIND,
    formatVersion: BACKUP_FORMAT_VERSION,
    schemaVersion: SAVED_LESSON_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    lessons: entries,
  };
}

/** e.g. learnfluent-lessons-2026-08-23.json */
export function backupFileName(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `learnfluent-lessons-${year}-${month}-${day}.json`;
}

export type BackupParseError =
  /** Not JSON at all. */
  | "invalid-json"
  /** Valid JSON, but not one of our backup files. */
  | "not-a-backup"
  /** Ours, but written for a lesson schema this build no longer renders. */
  | "wrong-schema"
  /** Ours and readable, but nothing in it survived validation. */
  | "no-lessons";

export type BackupParseResult =
  | { ok: true; entries: SavedLessonBackupEntry[]; dropped: number }
  | { ok: false; error: BackupParseError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A required string: present, a string, and not just whitespace. */
function requiredText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

/** An optional string, normalised to "" so components never see undefined. */
function optionalText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readMeanings(value: unknown): VocabularyMeaning[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((meaning) => ({
    definition: optionalText(meaning.definition),
    example: optionalText(meaning.example),
    vietnamese: optionalText(meaning.vietnamese),
  }));
}

function readWordFamily(value: unknown): WordFamilyEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((relative) => ({
      word: optionalText(relative.word),
      partOfSpeech: optionalText(relative.partOfSpeech),
    }))
    .filter((relative) => relative.word);
}

function readVocabulary(value: unknown): VocabularyItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: VocabularyItem[] = [];

  for (const raw of value) {
    if (!isRecord(raw)) {
      continue;
    }

    // `word` is the React key for the card AND the text the speak button
    // reads, so an item without one is dropped rather than patched up.
    const word = requiredText(raw.word);

    if (!word) {
      continue;
    }

    items.push({
      word,
      partOfSpeech: optionalText(raw.partOfSpeech),
      // Runs through the same normaliser the model output does, so a
      // hand-edited "b1" or "Intermediate" can never reach the colour lookup.
      cefr: normalizeCefr(raw.cefr),
      definitionEn: optionalText(raw.definitionEn),
      definitionVi: optionalText(raw.definitionVi),
      vietnamese: optionalText(raw.vietnamese),
      meanings: readMeanings(raw.meanings),
      collocations: Array.isArray(raw.collocations)
        ? raw.collocations.filter(
            (entry): entry is string => typeof entry === "string",
          )
        : [],
      wordFamily: readWordFamily(raw.wordFamily),
    });
  }

  return items;
}

function readIdioms(value: unknown): IdiomItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((idiom) => ({
      phrase: optionalText(idiom.phrase),
      meaning: optionalText(idiom.meaning),
      vietnamese: optionalText(idiom.vietnamese),
      note: typeof idiom.note === "string" ? idiom.note : undefined,
    }))
    .filter((idiom) => idiom.phrase);
}

function readExamples(value: unknown): ExampleSentence[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((example) => ({
      sentence: optionalText(example.sentence),
      keyPhrase: optionalText(example.keyPhrase),
      vietnamese: optionalText(example.vietnamese),
    }))
    .filter((example) => example.sentence);
}

/**
 * Quiz questions, kept only when they are actually answerable: four options and
 * an in-range answer index. A question failing either test would render as a
 * card no option can ever match, which reads as a broken app rather than a
 * broken file.
 */
function readQuiz(value: unknown): QuizQuestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const questions: QuizQuestion[] = [];

  for (const raw of value) {
    if (!isRecord(raw) || !Array.isArray(raw.options)) {
      continue;
    }

    const options = raw.options.filter(
      (option): option is string => typeof option === "string",
    );

    const answer = raw.correctAnswer;

    if (
      options.length !== 4 ||
      !Number.isInteger(answer) ||
      (answer as number) < 0 ||
      (answer as number) > 3
    ) {
      continue;
    }

    questions.push({
      question: optionalText(raw.question),
      options: [options[0], options[1], options[2], options[3]],
      correctAnswer: answer as 0 | 1 | 2 | 3,
      explanation: optionalText(raw.explanation),
    });
  }

  return questions;
}

function readLesson(value: unknown): Lesson | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = requiredText(value.title);
  const vocabulary = readVocabulary(value.vocabulary);
  const quiz = readQuiz(value.quiz);

  // A lesson with no title, no words or no answerable question isn't a lesson
  // worth restoring — the UI would open on an empty shell.
  if (!title || vocabulary.length === 0 || quiz.length === 0) {
    return null;
  }

  return {
    title,
    summary: optionalText(value.summary),
    level: normalizeCefr(value.level),
    levelNote: requiredText(value.levelNote) ?? undefined,
    vocabulary,
    idiomsAndSlang: readIdioms(value.idiomsAndSlang),
    exampleSentences: readExamples(value.exampleSentences),
    quiz,
  };
}

function readEntry(value: unknown): SavedLessonBackupEntry | null {
  if (!isRecord(value)) {
    return null;
  }

  const videoId = requiredText(value.videoId);

  if (!videoId) {
    return null;
  }

  const lesson = readLesson(isRecord(value.response) ? value.response.lesson : null);

  if (!lesson) {
    return null;
  }

  // A backup written on a machine with a wrong clock, or edited by hand, can
  // carry a savedAt that is missing or nonsense. Import compares these to
  // decide what wins, so an unusable one becomes "now" — the honest reading of
  // "this arrived just now" — rather than 1970, which would lose every merge.
  const savedAt =
    typeof value.savedAt === "number" && Number.isFinite(value.savedAt)
      ? value.savedAt
      : Date.now();

  return {
    videoId,
    locale: isLocale(value.locale) ? value.locale : DEFAULT_LOCALE,
    savedAt,
    title: requiredText(value.title) ?? lesson.title,
    vocabCount: lesson.vocabulary.length,
    response: { lesson, videoId },
  };
}

/**
 * Read a backup file's text into entries ready for `importSavedLessons`.
 *
 * Individual bad lessons are counted in `dropped` and the rest still import:
 * one corrupt entry in a file of forty should not cost the other thirty-nine.
 */
export function parseBackupFile(text: string): BackupParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "invalid-json" };
  }

  if (
    !isRecord(parsed) ||
    parsed.app !== BACKUP_APP ||
    parsed.kind !== BACKUP_KIND ||
    !Array.isArray(parsed.lessons)
  ) {
    return { ok: false, error: "not-a-backup" };
  }

  // The lesson payloads inside are written for one schema version. Restoring a
  // file from a different one would put lessons in storage that the reader then
  // discards on sight (see readFullIndex), which looks like a silent failure.
  if (
    typeof parsed.schemaVersion === "number" &&
    parsed.schemaVersion !== SAVED_LESSON_SCHEMA_VERSION
  ) {
    return { ok: false, error: "wrong-schema" };
  }

  const entries: SavedLessonBackupEntry[] = [];
  let dropped = 0;

  for (const raw of parsed.lessons) {
    const entry = readEntry(raw);

    if (entry) {
      entries.push(entry);
    } else {
      dropped += 1;
    }
  }

  if (entries.length === 0) {
    return { ok: false, error: "no-lessons" };
  }

  return { ok: true, entries, dropped };
}

/** Hand a JSON string to the browser as a download. Browser-only. */
export function downloadJson(json: string, fileName: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
