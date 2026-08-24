"use client";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import type { GenerateLessonResponse } from "@/types/lesson";

/**
 * Saved-lessons storage layer (localStorage-backed).
 *
 * All access to `window.localStorage` lives here so the UI never touches
 * storage directly — this module can later be swapped for a database/API
 * implementation without changing any components.
 *
 * IMPORTANT: every function must be called from the browser only (inside a
 * useEffect or an event handler). They guard against SSR but return empty/no-op
 * values on the server.
 */

const INDEX_KEY = "fluent-saved-lessons";

/**
 * Lessons are cached per language, because the translations, explanations and
 * quiz are generated in the reader's language — serving a Vietnamese lesson to
 * someone reading in Chinese would be worse than regenerating it.
 *
 * Vietnamese deliberately keeps the original un-prefixed key so lessons saved
 * before languages existed are still found, rather than silently orphaned.
 */
const lessonKey = (videoId: string, locale: Locale) =>
  locale === DEFAULT_LOCALE
    ? `fluent-lesson-${videoId}`
    : `fluent-lesson-${locale}-${videoId}`;

/**
 * Bump this whenever the lesson schema changes. Saved lessons (and index
 * entries) tagged with a different version are treated as stale: they are
 * discarded and cleaned up on read rather than rendered against the new UI.
 *
 * NOTE: this is also intended to support a future paid tier — e.g. lessons
 * generated with/without the vocabulary "depth" fields could be distinguished
 * or migrated via this version. No paywall/gating logic exists yet.
 */
export const SAVED_LESSON_SCHEMA_VERSION = 2;

export interface SavedLessonMeta {
  videoId: string;
  title: string;
  vocabCount: number;
  savedAt: number; // epoch ms
  version: number; // schema version this entry was saved under
  /** Language the lesson was generated in. Absent on pre-i18n entries. */
  locale: Locale;
}

/** Envelope actually persisted per lesson key (adds the schema version). */
interface StoredLesson {
  version: number;
  savedAt: number;
  response: GenerateLessonResponse;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/**
 * Read the saved-lessons index. The index is the single source of truth for
 * the list UI, so we never load full lesson payloads to render the list.
 * Corrupted JSON is discarded rather than throwing.
 */
function readFullIndex(): SavedLessonMeta[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(INDEX_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Keep only well-formed entries so one bad record can't break the list.
    // `locale` is filled in for entries written before languages existed —
    // those were all Vietnamese.
    const wellFormed = parsed
      .filter(
        (entry): entry is SavedLessonMeta =>
          !!entry &&
          typeof entry === "object" &&
          typeof (entry as SavedLessonMeta).videoId === "string" &&
          typeof (entry as SavedLessonMeta).title === "string" &&
          typeof (entry as SavedLessonMeta).vocabCount === "number" &&
          typeof (entry as SavedLessonMeta).savedAt === "number",
      )
      .map((entry) => ({ ...entry, locale: entry.locale ?? DEFAULT_LOCALE }));

    // Discard entries saved under a different schema version.
    const current = wellFormed.filter(
      (entry) => entry.version === SAVED_LESSON_SCHEMA_VERSION,
    );

    // If anything was dropped (stale version or malformed), clean up storage:
    // remove orphaned lesson keys and rewrite the index.
    if (current.length !== parsed.length) {
      const kept = new Set(
        current.map((entry) => `${entry.locale}:${entry.videoId}`),
      );
      const stale = parsed
        .filter(
          (entry): entry is { videoId: string; locale?: Locale } =>
            !!entry &&
            typeof entry === "object" &&
            typeof (entry as { videoId?: unknown }).videoId === "string",
        )
        .map((entry) => ({
          videoId: entry.videoId,
          locale: entry.locale ?? DEFAULT_LOCALE,
        }))
        .filter((entry) => !kept.has(`${entry.locale}:${entry.videoId}`));

      for (const entry of stale) {
        try {
          window.localStorage.removeItem(lessonKey(entry.videoId, entry.locale));
        } catch {
          // Ignore removal failures.
        }
      }

      try {
        writeIndex(current);
      } catch {
        // Ignore write failures; we still return the valid subset.
      }
    }

    return current;
  } catch {
    return [];
  }
}

/**
 * The saved lessons for one language, newest first. The stored index spans
 * every language so nothing is lost when the reader switches; the list UI only
 * ever shows the language currently being read.
 */
export function getSavedIndex(locale: Locale): SavedLessonMeta[] {
  return readFullIndex().filter((entry) => entry.locale === locale);
}

function writeIndex(index: SavedLessonMeta[]): void {
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

/**
 * Load a single full lesson by videoId. Returns null when missing or corrupt.
 */
export function getSavedLesson(
  videoId: string,
  locale: Locale,
): GenerateLessonResponse | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(lessonKey(videoId, locale));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredLesson>;

    // Discard anything not saved under the current schema version (this also
    // rejects the old un-versioned shape) and clean it up.
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.version !== SAVED_LESSON_SCHEMA_VERSION ||
      !parsed.response?.lesson
    ) {
      try {
        window.localStorage.removeItem(lessonKey(videoId, locale));
      } catch {
        // Ignore removal failures.
      }
      return null;
    }

    return parsed.response;
  } catch {
    return null;
  }
}

/**
 * True when a lesson for this videoId is already stored.
 */
export function hasSavedLesson(videoId: string, locale: Locale): boolean {
  if (!isBrowser()) {
    return false;
  }
  return window.localStorage.getItem(lessonKey(videoId, locale)) !== null;
}

/**
 * Attempt a set + retry, evicting the oldest saved lessons when storage is
 * full (QuotaExceededError). Returns true on success.
 */
function trySetWithEviction(
  key: string,
  value: string,
  index: SavedLessonMeta[],
): { ok: boolean; index: SavedLessonMeta[] } {
  let workingIndex = index;

  // Oldest-first candidates for eviction (index is newest-first).
  const evictionOrder = [...workingIndex].sort((a, b) => a.savedAt - b.savedAt);

  for (let attempt = 0; attempt <= evictionOrder.length; attempt += 1) {
    try {
      window.localStorage.setItem(key, value);
      return { ok: true, index: workingIndex };
    } catch (error) {
      const isQuota =
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED");

      if (!isQuota || attempt >= evictionOrder.length) {
        return { ok: false, index: workingIndex };
      }

      // Evict the oldest lesson that isn't the one we're trying to write.
      const victim = evictionOrder[attempt];
      const victimKey = victim
        ? lessonKey(victim.videoId, victim.locale)
        : null;
      if (victim && victimKey !== key) {
        try {
          window.localStorage.removeItem(victimKey as string);
        } catch {
          // Ignore removal failures and keep trying.
        }
        workingIndex = workingIndex.filter(
          (item) =>
            item.videoId !== victim.videoId || item.locale !== victim.locale,
        );
      }
    }
  }

  return { ok: false, index: workingIndex };
}

/**
 * Save a full lesson and upsert its index entry (newest-first, deduped by
 * videoId). Returns the updated index for the UI to render.
 */
export function saveLesson(
  response: GenerateLessonResponse,
  locale: Locale,
): SavedLessonMeta[] {
  if (!isBrowser()) {
    return [];
  }

  const { videoId, lesson } = response;
  const savedAt = Date.now();

  const meta: SavedLessonMeta = {
    videoId,
    title: lesson.title,
    vocabCount: Array.isArray(lesson.vocabulary) ? lesson.vocabulary.length : 0,
    savedAt,
    version: SAVED_LESSON_SCHEMA_VERSION,
    locale,
  };

  const stored: StoredLesson = {
    version: SAVED_LESSON_SCHEMA_VERSION,
    savedAt,
    response,
  };

  // Upsert into the full (all-languages) index: drop any existing entry for
  // this video IN THIS LANGUAGE, then put the new one first. The same video
  // saved in another language is a separate entry and must survive.
  let index = readFullIndex().filter(
    (entry) => entry.videoId !== videoId || entry.locale !== locale,
  );
  index = [meta, ...index];

  // Write the full lesson first (with quota eviction), then the index.
  const lessonWrite = trySetWithEviction(
    lessonKey(videoId, locale),
    JSON.stringify(stored),
    index,
  );

  if (!lessonWrite.ok) {
    // Couldn't store the lesson even after eviction; leave storage as-is.
    return getSavedIndex(locale);
  }

  // Eviction may have dropped some entries from the index; keep our new entry.
  index = lessonWrite.index.some(
    (entry) => entry.videoId === videoId && entry.locale === locale,
  )
    ? lessonWrite.index
    : [meta, ...lessonWrite.index];

  const indexWrite = trySetWithEviction(INDEX_KEY, JSON.stringify(index), index);

  return indexWrite.ok
    ? index.filter((entry) => entry.locale === locale)
    : getSavedIndex(locale);
}

/**
 * One lesson as it travels in a backup file: the index metadata plus the full
 * payload, so a restore can rebuild both halves of storage from the file alone.
 */
export interface SavedLessonBackupEntry {
  videoId: string;
  locale: Locale;
  savedAt: number;
  title: string;
  vocabCount: number;
  response: GenerateLessonResponse;
}

/**
 * Every saved lesson in this browser, ACROSS ALL LANGUAGES.
 *
 * Deliberately not scoped to the current locale the way the list UI is: this
 * feeds a backup, and a backup that quietly leaves out the lessons you saved
 * while reading in another language is worse than no backup at all.
 *
 * Index entries whose payload has gone missing are skipped rather than exported
 * as empty shells.
 */
export function getAllSavedLessons(): SavedLessonBackupEntry[] {
  if (!isBrowser()) {
    return [];
  }

  const entries: SavedLessonBackupEntry[] = [];

  for (const meta of readFullIndex()) {
    const response = getSavedLesson(meta.videoId, meta.locale);

    if (!response) {
      continue;
    }

    entries.push({
      videoId: meta.videoId,
      locale: meta.locale,
      savedAt: meta.savedAt,
      title: meta.title,
      vocabCount: meta.vocabCount,
      response,
    });
  }

  return entries;
}

export interface ImportResult {
  /** Lessons written to storage. */
  imported: number;
  /** Lessons already present in a same-or-newer copy. */
  skipped: number;
  /** Lessons that would not fit even after evicting older ones. */
  failed: number;
  /** The refreshed index for the language being read. */
  index: SavedLessonMeta[];
}

/**
 * Merge backup entries into storage.
 *
 * MERGE, never replace: an import must not be able to destroy lessons that are
 * only in this browser. Where both sides have the same video in the same
 * language, the newer `savedAt` wins — re-importing an old backup should not
 * roll a lesson back.
 *
 * Entries are written one at a time (rather than built up and written once) so
 * a browser that runs out of quota half way through still keeps everything it
 * managed to store, and can report exactly how much did not fit.
 */
export function importSavedLessons(
  entries: SavedLessonBackupEntry[],
  locale: Locale,
): ImportResult {
  if (!isBrowser()) {
    return { imported: 0, skipped: 0, failed: 0, index: [] };
  }

  let index = readFullIndex();
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  const isSame = (entry: SavedLessonMeta, candidate: SavedLessonBackupEntry) =>
    entry.videoId === candidate.videoId && entry.locale === candidate.locale;

  for (const entry of entries) {
    const existing = index.find((item) => isSame(item, entry));

    if (existing && existing.savedAt >= entry.savedAt) {
      skipped += 1;
      continue;
    }

    const meta: SavedLessonMeta = {
      videoId: entry.videoId,
      title: entry.title,
      vocabCount: entry.vocabCount,
      savedAt: entry.savedAt,
      version: SAVED_LESSON_SCHEMA_VERSION,
      locale: entry.locale,
    };

    const stored: StoredLesson = {
      version: SAVED_LESSON_SCHEMA_VERSION,
      savedAt: entry.savedAt,
      response: entry.response,
    };

    const candidateIndex = [
      meta,
      ...index.filter((item) => !isSame(item, entry)),
    ];

    const write = trySetWithEviction(
      lessonKey(entry.videoId, entry.locale),
      JSON.stringify(stored),
      candidateIndex,
    );

    // Eviction may have dropped entries from storage whether or not the write
    // itself landed, so the returned index is the truth either way.
    if (!write.ok) {
      index = write.index.filter((item) => !isSame(item, entry));
      failed += 1;
      continue;
    }

    index = write.index.some((item) => isSame(item, entry))
      ? write.index
      : [meta, ...write.index];
    imported += 1;
  }

  const indexWrite = trySetWithEviction(
    INDEX_KEY,
    JSON.stringify(index),
    index,
  );

  return {
    imported,
    skipped,
    failed,
    index: indexWrite.ok
      ? index.filter((entry) => entry.locale === locale)
      : getSavedIndex(locale),
  };
}

/**
 * Delete a saved lesson: both its lesson key and its index entry.
 * Returns the updated index.
 */
export function deleteSavedLesson(
  videoId: string,
  locale: Locale,
): SavedLessonMeta[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    window.localStorage.removeItem(lessonKey(videoId, locale));
  } catch {
    // Ignore removal failures.
  }

  const index = readFullIndex().filter(
    (entry) => entry.videoId !== videoId || entry.locale !== locale,
  );

  try {
    writeIndex(index);
  } catch {
    // If we can't persist the index, return what's actually stored.
    return getSavedIndex(locale);
  }

  return index.filter((entry) => entry.locale === locale);
}
