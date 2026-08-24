import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cacheTranscript, getCachedTranscript } from "@/lib/lessonCache";
import { fetchTranscriptText } from "@/lib/transcript";
import { extractVideoId as extractVideoIdPure } from "@/lib/videoId";

export function extractVideoId(url: string): string | null {
  console.log("[youtube] Extracting video ID from URL:", url.trim());
  const videoId = extractVideoIdPure(url);
  console.log(
    videoId
      ? `[youtube] Extracted video ID: ${videoId}`
      : "[youtube] Could not extract video ID from URL",
  );
  return videoId;
}

export async function getTranscriptText(
  videoId: string,
  t: Dictionary,
): Promise<string> {
  console.log("[youtube] Fetching transcript for video ID:", videoId);

  try {
    const text = await fetchTranscriptText(videoId, t);
    console.log(
      "[youtube] Transcript fetched successfully, length:",
      text.length,
      "chars",
    );
    return text;
  } catch (error) {
    console.error("[youtube] Transcript fetch failed:", error);
    if (error instanceof Error) {
      console.error("[youtube] Error message:", error.message);
      console.error("[youtube] Error stack:", error.stack);
    }
    throw error;
  }
}

/**
 * Same fetch, but served from Redis when we already have it.
 *
 * Deliberately a SEPARATE function rather than caching inside
 * `getTranscriptText`: the admin debug console calls that one, and an operator
 * asking "what does this video's transcript actually look like" must get the
 * live answer, not one stored a week ago.
 */
export async function getTranscriptTextCached(
  videoId: string,
  t: Dictionary,
): Promise<string> {
  const cached = await getCachedTranscript(videoId);

  if (cached) {
    console.log(
      "[youtube] Transcript cache hit for",
      videoId,
      `(${cached.length} chars, no provider call)`,
    );
    return cached;
  }

  const text = await getTranscriptText(videoId, t);
  await cacheTranscript(videoId, text);
  return text;
}

const MAX_TRANSCRIPT_CHARS = 14_000;

/**
 * Hesitation noise. These carry no meaning at all, so they go unconditionally.
 */
const HESITATION = /\b(?:uh+|um+|erm|mhm+|hmm+)\b,?\s*/gi;

/**
 * Discourse fillers, removed ONLY where the surrounding punctuation shows they
 * are parenthetical.
 *
 * "you know" and "I mean" are also real clauses ("if you know the answer",
 * "I mean it"), and this text becomes example sentences a learner is taught
 * from — a mangled sentence here is worse than a few wasted tokens. `like` is
 * left alone entirely for the same reason: it is a verb far more often than it
 * is filler.
 */
const FILLER_WORDS = "you know|i mean|sort of|kind of|you see";
const FILLER_BETWEEN_COMMAS = new RegExp(`,\\s*(?:${FILLER_WORDS})\\s*,`, "gi");
const FILLER_AFTER_SENTENCE = new RegExp(
  `(^|[.!?]\\s+)(?:${FILLER_WORDS}),?\\s*`,
  "gi",
);
const FILLER_BEFORE_COMMA = new RegExp(`\\s+(?:${FILLER_WORDS})\\s*,`, "gi");

/** "we we were" → "we were". Auto-captions and live speech are full of these. */
const REPEATED_WORD = /\b(\w+)(\s+\1\b)+/gi;

/** "some of the stuff, some of the stuff" → "some of the stuff". */
const REPEATED_PHRASE = /\b([\w']+(?:\s+[\w']+){1,4}),?\s+\1\b/gi;

function stripNoise(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(HESITATION, " ")
    .replace(FILLER_BETWEEN_COMMAS, ", ")
    .replace(FILLER_AFTER_SENTENCE, "$1")
    .replace(FILLER_BEFORE_COMMA, ",")
    .replace(REPEATED_WORD, "$1")
    .replace(REPEATED_PHRASE, "$1")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Cut on word boundaries so no window ever starts or ends mid-word. */
function sliceWords(text: string, start: number, length: number): string {
  const from = start === 0 ? 0 : text.indexOf(" ", start) + 1 || start;
  const raw = text.slice(from, from + length);
  const lastSpace = raw.lastIndexOf(" ");

  return (lastSpace > length * 0.5 ? raw.slice(0, lastSpace) : raw).trim();
}

const WINDOWS = 6;

/**
 * Even coverage of a long transcript instead of its first N characters.
 *
 * Cutting the tail is what this used to do, and on an hour-long podcast it
 * meant every lesson was built from the first ~18 minutes: the vocabulary of
 * the other 40 minutes simply never existed. Sampling costs the same tokens
 * and describes the whole video.
 *
 * The opening is kept whole (it establishes who is speaking and about what)
 * and the final window is anchored to the END, because interviews put their
 * conclusions there.
 */
const SAMPLE_HEADER = "[Excerpts sampled evenly across the whole video.]";
const SAMPLE_JOIN = "\n[...]\n";

function sampleEvenly(text: string, budget: number): string {
  // The header and the joins are part of what gets sent, so they come out of
  // the budget first — otherwise the result quietly exceeds the cap it exists
  // to enforce.
  const overhead = SAMPLE_HEADER.length + SAMPLE_JOIN.length * (WINDOWS + 1);
  const contentBudget = budget - overhead;

  const head = sliceWords(text, 0, Math.floor(contentBudget * 0.3));
  const rest = text.slice(head.length);
  const perWindow = Math.floor((contentBudget - head.length) / WINDOWS);

  // Too small to sample into meaningful pieces — a handful of 50-character
  // fragments teaches nothing. Fall back to the opening alone.
  if (perWindow < 300 || rest.length <= perWindow) {
    return head;
  }

  const stride = Math.floor((rest.length - perWindow) / (WINDOWS - 1));
  const windows: string[] = [];

  for (let index = 0; index < WINDOWS - 1; index += 1) {
    windows.push(sliceWords(rest, index * stride, perWindow));
  }

  windows.push(sliceWords(rest, rest.length - perWindow, perWindow));

  return [SAMPLE_HEADER, head, ...windows].join(SAMPLE_JOIN);
}

/**
 * Strip the noise, then sample if it still doesn't fit.
 *
 * Replaces the old `truncateTranscript`. For a video under the cap this is a
 * straight ~10% saving; over the cap it saves nothing (the cap already bound
 * the input) and buys coverage instead.
 */
export function compressTranscript(text: string): string {
  const cleaned = stripNoise(text);

  if (cleaned.length <= MAX_TRANSCRIPT_CHARS) {
    console.log(
      "[youtube] Transcript cleaned:",
      text.length,
      "→",
      cleaned.length,
      "chars (fits, no sampling)",
    );
    return cleaned;
  }

  const sampled = sampleEvenly(cleaned, MAX_TRANSCRIPT_CHARS);

  console.log(
    "[youtube] Transcript cleaned and sampled:",
    text.length,
    "→",
    cleaned.length,
    "→",
    sampled.length,
    `chars (${WINDOWS + 1} windows across the full video)`,
  );

  return sampled;
}
