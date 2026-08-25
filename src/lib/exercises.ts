import type { Lesson } from "@/types/lesson";

/**
 * Extra practice formats built ENTIRELY from a lesson that already exists.
 *
 * Everything here is derived on the client from `Lesson` — the same object the
 * quiz and vocabulary tabs already render. No network call, no model call, no
 * extra tokens: a saved lesson opened offline produces the same exercises as a
 * freshly generated one. That constraint is why, for example, fill-in-the-blank
 * reuses `exampleSentences[].keyPhrase` instead of asking a model where to cut
 * a gap.
 */

export type ExerciseKind =
  | "fillBlank"
  | "matching"
  | "dictation"
  | "wordOrder";

export const EXERCISE_KINDS: ExerciseKind[] = [
  "fillBlank",
  "matching",
  "dictation",
  "wordOrder",
];

export interface FillBlankExercise {
  id: string;
  /** Sentence text before the gap. */
  before: string;
  /** Sentence text after the gap. */
  after: string;
  /** The exact text that was cut out — what the learner has to type. */
  answer: string;
  /** Translation of the whole sentence, shown as a clue. */
  vietnamese?: string;
  /** Rebuilt sentence, for the speak button after answering. */
  sentence: string;
}

export interface MatchingPair {
  id: string;
  left: string; // English
  right: string; // learner-language
}

export interface MatchingRound {
  id: string;
  pairs: MatchingPair[];
  /** Right column in its own order, so the answer isn't the row it sits on. */
  shuffledRight: MatchingPair[];
}

export interface DictationExercise {
  id: string;
  sentence: string;
  vietnamese?: string;
}

export interface WordOrderExercise {
  id: string;
  /** Correct sentence, kept for checking and for the speak button. */
  sentence: string;
  /** Whitespace tokens of `sentence`, shuffled. */
  tokens: string[];
  vietnamese?: string;
}

export interface LessonExercises {
  fillBlank: FillBlankExercise[];
  matching: MatchingRound[];
  dictation: DictationExercise[];
  wordOrder: WordOrderExercise[];
}

/** How many items each format is capped at, so a tab stays a session not a slog. */
const LIMITS = {
  fillBlank: 8,
  dictation: 6,
  wordOrder: 6,
  matchingPairsPerRound: 5,
  matchingRounds: 4,
} as const;

/** Sentence length bounds (in whitespace tokens) per format. */
const LENGTH = {
  dictation: { min: 4, max: 16 },
  wordOrder: { min: 4, max: 12 },
} as const;

// --- deterministic randomness -------------------------------------------
// Exercises are rebuilt whenever the Practice tab mounts. A seeded PRNG keeps
// the same lesson producing the same exercises, so switching tabs mid-round
// doesn't reshuffle the answer the learner was halfway through.

function seedFrom(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

/**
 * Shuffle that refuses to return the input order, so a word-order puzzle is
 * never handed over already solved. Gives up after a few tries (a one-token
 * sentence has no other order, but those are filtered out anyway).
 */
function shuffleDifferently<T>(items: T[], random: () => number): T[] {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = shuffle(items, random);
    if (candidate.some((value, index) => value !== items[index])) {
      return candidate;
    }
  }
  return [...items].reverse();
}

// --- answer checking -----------------------------------------------------

/**
 * Compare what a learner typed against the expected English, ignoring the
 * things that are not the point of the exercise: case, punctuation, curly vs.
 * straight quotes, and repeated spaces. "Its just around the corner!" and
 * "it's just around the corner" both count — apostrophes are kept, so
 * "its" vs "it's" still differ, but stray commas don't fail an answer.
 */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9'À-ɏ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAnswerCorrect(given: string, expected: string): boolean {
  return (
    normalizeAnswer(given) === normalizeAnswer(expected) &&
    normalizeAnswer(expected).length > 0
  );
}

/** Word-by-word verdict for the dictation review line. */
export interface DictationWordResult {
  word: string;
  correct: boolean;
}

export function diffDictation(
  given: string,
  expected: string,
): DictationWordResult[] {
  const givenWords = normalizeAnswer(given).split(" ").filter(Boolean);
  const expectedWords = expected.split(/\s+/).filter(Boolean);

  return expectedWords.map((word, index) => ({
    word,
    correct: normalizeAnswer(word) === (givenWords[index] ?? ""),
  }));
}

// --- source material -----------------------------------------------------

interface SourceSentence {
  sentence: string;
  vietnamese?: string;
  keyPhrase?: string;
}

/**
 * Every English sentence the lesson already contains: the grammar examples
 * first (they were written to showcase a phrase, so they make the best gaps),
 * then the per-meaning vocabulary examples.
 */
function collectSentences(lesson: Lesson): SourceSentence[] {
  const seen = new Set<string>();
  const out: SourceSentence[] = [];

  function push(sentence: SourceSentence) {
    const text = sentence.sentence?.trim();
    if (!text) {
      return;
    }
    const key = normalizeAnswer(text);
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    out.push({ ...sentence, sentence: text });
  }

  for (const item of lesson.exampleSentences ?? []) {
    push({
      sentence: item.sentence,
      vietnamese: item.vietnamese,
      keyPhrase: item.keyPhrase,
    });
  }

  for (const word of lesson.vocabulary ?? []) {
    for (const meaning of word.meanings ?? []) {
      push({
        sentence: meaning.example,
        vietnamese: meaning.vietnamese,
        keyPhrase: word.word,
      });
    }
  }

  return out;
}

function tokenCount(sentence: string): number {
  return sentence.split(/\s+/).filter(Boolean).length;
}

/**
 * Locate `phrase` inside `sentence` case-insensitively, on a word boundary.
 * Returns null when the phrase isn't literally there — vocabulary examples
 * sometimes carry an inflected form ("developed" for "develop"), and a gap we
 * can't cut cleanly is better skipped than faked.
 */
function findPhrase(
  sentence: string,
  phrase: string,
): { start: number; end: number } | null {
  const needle = phrase.trim();
  if (!needle) {
    return null;
  }

  const haystack = sentence.toLowerCase();
  const target = needle.toLowerCase();
  let from = 0;

  while (from <= haystack.length - target.length) {
    const start = haystack.indexOf(target, from);
    if (start === -1) {
      return null;
    }

    const before = start === 0 ? "" : haystack[start - 1];
    const after = haystack[start + target.length] ?? "";
    const isWordChar = (char: string) => /[a-z0-9]/.test(char);

    if (!isWordChar(before) && !isWordChar(after)) {
      return { start, end: start + target.length };
    }

    from = start + 1;
  }

  return null;
}

// --- builders ------------------------------------------------------------

function buildFillBlank(
  sentences: SourceSentence[],
  random: () => number,
): FillBlankExercise[] {
  const usable = sentences.filter((item) => Boolean(item.keyPhrase));
  const out: FillBlankExercise[] = [];

  for (const item of shuffle(usable, random)) {
    if (out.length >= LIMITS.fillBlank) {
      break;
    }

    const found = findPhrase(item.sentence, item.keyPhrase ?? "");
    if (!found) {
      continue;
    }

    out.push({
      id: `fill-${out.length}-${normalizeAnswer(item.sentence).slice(0, 24)}`,
      before: item.sentence.slice(0, found.start),
      after: item.sentence.slice(found.end),
      answer: item.sentence.slice(found.start, found.end),
      vietnamese: item.vietnamese,
      sentence: item.sentence,
    });
  }

  return out;
}

function buildMatching(
  lesson: Lesson,
  random: () => number,
): MatchingRound[] {
  const seen = new Set<string>();
  const candidates: MatchingPair[] = [];

  function push(left: string, right: string) {
    const english = left?.trim();
    const translation = right?.trim();
    if (!english || !translation) {
      return;
    }
    // Both columns must be unique: two rows sharing a translation would make
    // a "wrong" match indistinguishable from a right one.
    const leftKey = `l:${normalizeAnswer(english)}`;
    const rightKey = `r:${normalizeAnswer(translation)}`;
    if (seen.has(leftKey) || seen.has(rightKey)) {
      return;
    }
    seen.add(leftKey);
    seen.add(rightKey);
    candidates.push({
      id: `pair-${candidates.length}-${leftKey}`,
      left: english,
      right: translation,
    });
  }

  for (const word of lesson.vocabulary ?? []) {
    push(word.word, word.vietnamese);
  }
  for (const idiom of lesson.idiomsAndSlang ?? []) {
    push(idiom.phrase, idiom.vietnamese);
  }

  const pool = shuffle(candidates, random);
  const rounds: MatchingRound[] = [];

  for (
    let start = 0;
    start < pool.length && rounds.length < LIMITS.matchingRounds;
    start += LIMITS.matchingPairsPerRound
  ) {
    const pairs = pool.slice(start, start + LIMITS.matchingPairsPerRound);
    // A trailing round of one pair matches itself; fold it away.
    if (pairs.length < 2) {
      break;
    }
    rounds.push({
      id: `round-${rounds.length}`,
      pairs,
      shuffledRight: shuffleDifferently(pairs, random),
    });
  }

  return rounds;
}

function buildDictation(
  sentences: SourceSentence[],
  random: () => number,
): DictationExercise[] {
  const usable = sentences.filter((item) => {
    const count = tokenCount(item.sentence);
    return count >= LENGTH.dictation.min && count <= LENGTH.dictation.max;
  });

  return shuffle(usable, random)
    .slice(0, LIMITS.dictation)
    .map((item, index) => ({
      id: `dictation-${index}-${normalizeAnswer(item.sentence).slice(0, 24)}`,
      sentence: item.sentence,
      vietnamese: item.vietnamese,
    }));
}

function buildWordOrder(
  sentences: SourceSentence[],
  random: () => number,
): WordOrderExercise[] {
  const usable = sentences.filter((item) => {
    const count = tokenCount(item.sentence);
    return count >= LENGTH.wordOrder.min && count <= LENGTH.wordOrder.max;
  });

  return shuffle(usable, random)
    .slice(0, LIMITS.wordOrder)
    .map((item, index) => {
      const tokens = item.sentence.split(/\s+/).filter(Boolean);
      return {
        id: `order-${index}-${normalizeAnswer(item.sentence).slice(0, 24)}`,
        sentence: tokens.join(" "),
        tokens: shuffleDifferently(tokens, random),
        vietnamese: item.vietnamese,
      };
    });
}

/**
 * Derive every practice format from a lesson. Cheap enough to call on render,
 * but callers should memoise on the lesson so the seeded shuffles stay put.
 */
export function buildExercises(lesson: Lesson): LessonExercises {
  const random = mulberry32(seedFrom(lesson.title ?? "lesson"));
  const sentences = collectSentences(lesson);

  return {
    fillBlank: buildFillBlank(sentences, random),
    matching: buildMatching(lesson, random),
    dictation: buildDictation(sentences, random),
    wordOrder: buildWordOrder(sentences, random),
  };
}

/**
 * The formats this particular lesson can actually offer. A lesson with no
 * idioms and few example sentences may simply not support every format, and an
 * empty exercise tab is worse than a missing one.
 */
export function availableExerciseKinds(
  exercises: LessonExercises,
): ExerciseKind[] {
  return EXERCISE_KINDS.filter((kind) => exercises[kind].length > 0);
}

/** How many questions a format holds — matching counts pairs, not rounds. */
export function exerciseCount(
  exercises: LessonExercises,
  kind: ExerciseKind,
): number {
  if (kind === "matching") {
    return exercises.matching.reduce(
      (sum, round) => sum + round.pairs.length,
      0,
    );
  }
  return exercises[kind].length;
}
