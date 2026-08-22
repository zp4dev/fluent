import type { Locale } from "@/lib/i18n/config";
import { getRedis } from "@/lib/redis";
import type { Lesson } from "@/types/lesson";

/**
 * Redis cache for generated lessons and fetched transcripts.
 *
 * This is the single largest cost lever in the app: a repeat of the same video
 * in the same language at the same tier is served for zero tokens, and output
 * tokens are ~79% of what a lesson costs. Learners here converge on the same
 * handful of channels, so repeats are common rather than incidental.
 *
 * Every function degrades to a no-op when Upstash is not configured (local dev
 * without Redis), mirroring lib/entitlements.ts — a missing cache must never be
 * the reason a lesson fails to generate.
 */

/**
 * Bump this whenever the PROMPT or the `Lesson` shape changes.
 *
 * The cache is keyed on it, so an old entry becomes unreachable instead of
 * being served: without the bump, everyone with a cached lesson would keep
 * receiving output from the previous prompt long after it was replaced, and
 * the change would look like it simply didn't work.
 */
export const PROMPT_VERSION = 1;

/** Long enough to be worth having, short enough that a stale entry ages out. */
const LESSON_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Transcripts are cached separately and for less time. This one saves Supadata
 * credits rather than tokens: a free-tier lesson and a Pro lesson for the same
 * video are two different cache entries, and without this they would each pay
 * for the same fetch.
 */
const TRANSCRIPT_TTL_SECONDS = 7 * 24 * 60 * 60;

/**
 * Free and Pro lessons are generated from different prompts and are NOT
 * interchangeable — the tier belongs in the key so a free lesson can never be
 * served to someone who paid for depth.
 */
export type LessonTier = "pro" | "free";

export interface LessonCacheKey {
  videoId: string;
  locale: Locale;
  tier: LessonTier;
}

function lessonKey({ videoId, locale, tier }: LessonCacheKey): string {
  return `lesson:v${PROMPT_VERSION}:${videoId}:${locale}:${tier}`;
}

function transcriptKey(videoId: string): string {
  return `transcript:${videoId}`;
}

/** Cheap sanity check so a malformed entry is refetched instead of rendered. */
function looksLikeLesson(value: unknown): value is Lesson {
  if (!value || typeof value !== "object") {
    return false;
  }

  const lesson = value as Partial<Lesson>;

  return (
    typeof lesson.title === "string" &&
    Array.isArray(lesson.vocabulary) &&
    lesson.vocabulary.length > 0 &&
    Array.isArray(lesson.quiz)
  );
}

export async function getCachedLesson(
  key: LessonCacheKey,
): Promise<Lesson | null> {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get<Lesson>(lessonKey(key));
    return looksLikeLesson(cached) ? cached : null;
  } catch (error) {
    // A cache read that fails is a cache miss, never an error for the caller.
    console.error("[lessonCache] Lesson read failed:", error);
    return null;
  }
}

export async function cacheLesson(
  key: LessonCacheKey,
  lesson: Lesson,
): Promise<void> {
  const redis = getRedis();

  if (!redis) {
    return;
  }

  try {
    await redis.set(lessonKey(key), lesson, { ex: LESSON_TTL_SECONDS });
  } catch (error) {
    // The lesson is already generated and on its way to the reader. Failing to
    // cache it costs a future call, not this one.
    console.error("[lessonCache] Lesson write failed:", error);
  }
}

export async function getCachedTranscript(
  videoId: string,
): Promise<string | null> {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  try {
    const cached = await redis.get<string>(transcriptKey(videoId));
    return typeof cached === "string" && cached.trim() ? cached : null;
  } catch (error) {
    console.error("[lessonCache] Transcript read failed:", error);
    return null;
  }
}

export async function cacheTranscript(
  videoId: string,
  transcript: string,
): Promise<void> {
  const redis = getRedis();

  if (!redis || !transcript.trim()) {
    return;
  }

  try {
    await redis.set(transcriptKey(videoId), transcript, {
      ex: TRANSCRIPT_TTL_SECONDS,
    });
  } catch (error) {
    console.error("[lessonCache] Transcript write failed:", error);
  }
}
