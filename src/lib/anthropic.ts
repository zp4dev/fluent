import Anthropic from "@anthropic-ai/sdk";

import { getAiProviderConfig, type Provider } from "@/lib/aiProvider";

import { normalizeCefr } from "@/lib/cefr";
import { ASK_MODEL_FOR_CEFR, lookupCefr } from "@/lib/cefrLexicon";
import { UserFacingError } from "@/lib/errors";
import { DEFAULT_LOCALE, LOCALE_INFO, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Lesson } from "@/types/lesson";

/**
 * The lesson always TEACHES English. What varies by locale is the learner's own
 * language — the translations, explanations, quiz text and notes are written in
 * whatever language the app is being read in.
 *
 * The JSON keys still say "vietnamese" / "definitionVi" because saved lessons
 * in browsers carry that shape; the prompt therefore spells out that those
 * fields hold the learner's language, whatever it is.
 */

// Depth fields (meanings, collocations, wordFamily) are Pro-only. They are kept
// in a single block here so the free-tier prompt can omit them cleanly, and so
// the paid feature can be toggled server-side via `includeDepth`.
const vocabDepthSchema = (lang: string) => `,
      "meanings": [{ "definition": "English", "example": "English sentence", "vietnamese": "${lang}" }],
      "collocations": ["English collocation"],
      "wordFamily": [{ "word": "English", "partOfSpeech": "English" }]`;

const vocabDepthLanguageRule = (lang: string) =>
  `\n- meanings.definition, meanings.example, collocations, and wordFamily.word/partOfSpeech MUST be in English (the content being taught); meanings.vietnamese MUST be in ${lang}`;

const vocabDepthRequirements = (lang: string) => `

Vocabulary DEPTH fields (meanings, collocations, wordFamily) — ALWAYS include them for this (Pro) lesson:
- meanings: exactly 1 entry, or 2 when the word genuinely has a second common meaning worth teaching. Never more than 2. Each needs an English definition, an English example sentence, and a ${lang} translation of that example.
- collocations: 2-4 common English collocations or set phrases that use the word (English only)
- wordFamily: related English word forms with their part of speech (e.g. "develop" -> "development" (noun), "developer" (noun)). Use [] only if there are no natural related forms.`;

// Free tier: give a single item full depth as a "Pro preview"; all others keep
// only the base fields.
const VOCAB_PREVIEW_REQUIREMENTS = `

Vocabulary DEPTH fields (meanings, collocations, wordFamily) — for THIS lesson, include them for EXACTLY ONE vocabulary item as a preview of the Pro version:
- Choose the SINGLE word that benefits MOST from depth: one that has multiple common meanings, real collocations, and related word forms (a word family).
- For that ONE item only, fully populate: meanings (1-2 entries, never more), collocations (2-4 common phrases), and wordFamily (related forms with part of speech).
- For ALL OTHER vocabulary items, OMIT meanings, collocations, and wordFamily entirely (either leave those keys out or set them to empty arrays []).
- Exactly one item — no more, no fewer — may contain populated depth fields.`;

/**
 * When the learner's language IS English, "translate into the learner's
 * language" is a contradiction — so those fields become plain-English glosses
 * instead, which is what an English-speaking learner actually wants.
 */
const SAME_LANGUAGE_NOTE = `

NOTE — the learner's language is English, the same language being taught: for the learner-language fields (definitionVi, vietnamese, meanings.vietnamese, idiom meanings and notes, quiz questions, options and explanations) write clear, simpler English paraphrases and synonyms rather than a translation. Never leave them empty and never repeat definitionEn verbatim.`;

/**
 * Exported so the prompt can be MEASURED without spending a call: it is the
 * fixed part of every request, and "how big is it" is the first question any
 * cost work has to answer.
 */
export function buildSystemPrompt(
  includeDepth: boolean,
  locale: Locale,
): string {
  const lang = LOCALE_INFO[locale].promptName;
  const depthRequirements = includeDepth
    ? vocabDepthRequirements(lang)
    : VOCAB_PREVIEW_REQUIREMENTS;
  const sameLanguageNote = locale === "en" ? SAME_LANGUAGE_NOTE : "";

  // Every mention of the per-word level disappears together when the local
  // lexicon takes over (see ASK_MODEL_FOR_CEFR) — a schema field the prompt
  // still describes but nobody reads is how prompts rot.
  const cefrField = ASK_MODEL_FOR_CEFR
    ? `\n      "cefr": "A1|A2|B1|B2|C1|C2",`
    : "";
  const cefrCodeRule = ASK_MODEL_FOR_CEFR
    ? "level and vocabulary.cefr are"
    : "level is";
  const cefrRequired = ASK_MODEL_FOR_CEFR ? "cefr, " : "";
  const cefrWordRule = ASK_MODEL_FOR_CEFR
    ? `\n- "vocabulary.cefr" is the level at which a learner normally MEETS that word — it is per word and will often differ from the video's overall level`
    : "";

  return `You are an expert English teacher creating lessons for ${lang} speakers.

Given a YouTube video transcript, produce a structured English lesson as valid JSON only — no markdown, no code fences, no extra text.

The JSON must match this schema exactly. Field values below are TYPE HINTS, not
content — the Language rules that follow say which language each field takes:
{
  "title": "short title",
  "summary": "2-3 sentences on what the learner will study",
  "level": "A1|A2|B1|B2|C1|C2",
  "levelNote": "one sentence",
  "vocabulary": [
    {
      "word": "English word/phrase from the transcript",
      "partOfSpeech": "noun|verb|adjective|adverb|phrasal verb|...",${cefrField}
      "definitionEn": "English definition",
      "definitionVi": "explanation of the word",
      "vietnamese": "translation or equivalent"${vocabDepthSchema(lang)}
    }
  ],
  "idiomsAndSlang": [
    { "phrase": "English idiom/slang", "meaning": "what it means", "vietnamese": "equivalent or paraphrase", "note": "optional usage note" }
  ],
  "exampleSentences": [
    { "sentence": "English sentence", "keyPhrase": "the English phrase it highlights, appearing verbatim in sentence", "vietnamese": "translation of sentence" }
  ],
  "quiz": [
    { "question": "", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "" }
  ]
}

Language rules:
- title, summary and levelNote MUST be entirely in ${lang}
- ${cefrCodeRule} bare CEFR codes — write them exactly as A1/A2/B1/B2/C1/C2, never translated and never spelled out
- vocabulary.word, partOfSpeech, and definitionEn MUST be in English (the content being taught)
- idiomsAndSlang.phrase and exampleSentences.sentence MUST be in English (the content being taught)
- definitionVi, vietnamese, idiom meanings, notes, quiz questions, and explanations MUST be in ${lang} (these keys are named after Vietnamese for legacy reasons — always fill them in ${lang})${vocabDepthLanguageRule(lang)}

Requirements:
- Include 8-10 vocabulary items drawn from the transcript — pick the ones a learner gains most from, not simply the first ones that appear
- For each vocabulary item, partOfSpeech, ${cefrRequired}definitionEn, definitionVi, and vietnamese are ALWAYS required
- Include 3-6 idioms or slang expressions (use [] if none appear)
- Include exactly 3 example sentences using key phrases from the lesson
- Include exactly 5 quiz questions with 4 options each
- correctAnswer must be the 0-based index of the correct option
- Use simple, learner-friendly ${lang} for all ${lang} text${sameLanguageNote}${depthRequirements}

CEFR level rules:
- "level" rates the DIFFICULTY OF THE ENGLISH, not how interesting or how technical the topic is: speaking speed, sentence length, how common the vocabulary is, and how much idiom and slang appear
- Judge the video as a whole and pick the single level a learner needs in order to follow it comfortably${cefrWordRule}
- Write every level as a bare code: "B1". Never "B1+", never "B1-B2", never "Intermediate (B1)", never a range and never a plus or minus
- "levelNote" is ONE sentence in ${lang} naming the concrete reason for the level (e.g. the speaker talks fast, the vocabulary is everyday, there are many idioms). Do not merely repeat the level

CRITICAL — Quiz rules:
- NEVER ask about the video's story, plot, events, people, places, times, or factual details (e.g. "what time did they wake up?", "where did they go?", "what happened next?")
- ALL quiz questions MUST test English language knowledge only: vocabulary meanings, grammar usage, idiom/slang meanings, choosing the correct word/phrase, fill-in-the-blank, or identifying correct usage
- Every question must test whether the learner understands an English word, phrase, or grammar pattern from THIS lesson
- Quiz question text must be in ${lang}; quiz answer options must ALL be in ${lang} (they are translations/explanations of the English word being tested)
- Good example (written in ${lang}): "What does 'break the ice' mean?"
- Bad example: "In the video, where did they go after breakfast?"`;
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  return trimmed;
}

function parseLesson(raw: string, t: Dictionary): Lesson {
  const parsed = JSON.parse(stripJsonFences(raw)) as Lesson;

  if (!parsed.title || !parsed.vocabulary?.length || parsed.quiz?.length !== 5) {
    throw new UserFacingError(t.api.badLessonShape);
  }

  if (parsed.exampleSentences?.length !== 3) {
    throw new UserFacingError(t.api.badExampleCount);
  }

  // `correctAnswer` is typed 0|1|2|3, but nothing enforces that at runtime. An
  // out-of-range index makes the quiz silently unanswerable (no option ever
  // matches), so reject it here instead of shipping a broken lesson.
  const quizIsWellFormed = parsed.quiz.every(
    (question) =>
      question.options?.length === 4 &&
      Number.isInteger(question.correctAnswer) &&
      question.correctAnswer >= 0 &&
      question.correctAnswer <= 3,
  );

  if (!quizIsWellFormed) {
    throw new UserFacingError(t.api.badQuiz);
  }

  return normalizeLevels(parsed);
}

/**
 * Force every CEFR value through `normalizeCefr` before the lesson leaves this
 * module, so nothing downstream ever sees "b1+" or "Intermediate".
 *
 * A missing or unrecognisable level is dropped, NOT an error: the level is a
 * nice-to-have label on a lesson we have already paid for, so failing the whole
 * generation over it would be an expensive way to lose a chip.
 */
function normalizeLevels(lesson: Lesson): Lesson {
  const levelNote =
    typeof lesson.levelNote === "string" && lesson.levelNote.trim()
      ? lesson.levelNote.trim()
      : undefined;

  return {
    ...lesson,
    // The overall level stays the model's call: it comes from speaking speed,
    // sentence length and idiom density, none of which a word list can see.
    level: normalizeCefr(lesson.level),
    levelNote,
    vocabulary: lesson.vocabulary.map((item) => ({
      ...item,
      // Per-word level: the local table WINS wherever it has an answer, so a
      // common word gets the same level on every run. The model's answer is
      // the fallback for everything the table doesn't know (which is most of
      // the C1/C2 vocabulary a real transcript throws up).
      cefr:
        lookupCefr(item.word) ??
        (ASK_MODEL_FOR_CEFR ? normalizeCefr(item.cefr) : undefined),
    })),
  };
}

interface GenerateLessonOptions {
  /**
   * When true, generate the richer Pro-tier vocabulary (meanings,
   * collocations, word family). Free tier omits these depth fields.
   */
  includeDepth?: boolean;
  /**
   * The learner's language. Decides what language every translation,
   * explanation and quiz question is written in — and, via the dictionary,
   * what language generation errors come back in.
   */
  locale?: Locale;
}

/**
 * The one place the model is actually called.
 *
 * Both the real lesson path and the debug console go through here, so what
 * /admin-dev shows is the request production makes — not a lookalike that can
 * drift away from it.
 *
 * Every supported provider speaks the Anthropic Messages API, so one SDK
 * client covers all of them; PROVIDER only decides the host's conventions
 * (see lib/aiProvider.ts).
 */
async function requestLesson(
  transcript: string,
  includeDepth: boolean,
  locale: Locale,
) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const config = getAiProviderConfig();

  const client = new Anthropic({
    apiKey,
    // Passed explicitly rather than left to the SDK's own env lookup: the SDK
    // would read ANTHROPIC_BASE_URL raw and miss the /v1 normalisation.
    baseURL: config.baseUrl,
    defaultHeaders: config.defaultHeaders,
  });

  const system = buildSystemPrompt(includeDepth, locale);
  const userPrompt = `Create an English lesson for ${LOCALE_INFO[locale].promptName} speakers from this YouTube transcript:\n\n${transcript}`;

  const message = await client.messages.create({
    model: config.model,
    // Larger output budget for the richer Pro vocabulary schema (meanings,
    // collocations, word family). Free tier is a bit higher than base to fit
    // the one full-depth "Pro preview" item.
    max_tokens: includeDepth ? 8192 : 5120,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });

  return { message, config, system, userPrompt };
}

export async function generateLesson(
  transcript: string,
  options: GenerateLessonOptions = {},
): Promise<Lesson> {
  const includeDepth = options.includeDepth ?? false;
  const locale = options.locale ?? DEFAULT_LOCALE;
  const t = getDictionary(locale);

  const { message, config } = await requestLesson(
    transcript,
    includeDepth,
    locale,
  );

  // Everything needed to answer "where do the tokens actually go" from the
  // logs alone: which model, which tier, and how much of the input was the
  // transcript. Output tokens dominate the bill (they cost 5x input), so the
  // in/out split is the number worth watching, not the total.
  console.log(
    "[USAGE]",
    JSON.stringify({
      model: config.model,
      tier: includeDepth ? "pro" : "free",
      locale,
      transcriptChars: transcript.length,
      ...message.usage,
    }),
  );

  // Check why generation stopped BEFORE parsing. A response cut off at
  // max_tokens is truncated mid-JSON, which would otherwise surface as an
  // opaque "Unexpected end of JSON input".
  if (message.stop_reason === "max_tokens") {
    throw new UserFacingError(t.api.lessonTooLong);
  }

  if (message.stop_reason === "refusal") {
    throw new UserFacingError(t.api.refusedContent);
  }

  const textBlock = message.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new UserFacingError(t.api.noTextContent);
  }

  return parseLesson(textBlock.text, t);
}

/**
 * What the model returned, before any of it is trusted.
 *
 * For /admin-dev. Nothing throws: a failed call is a RESULT here, not an
 * exception, because the failure is exactly what the operator opened the page
 * to look at. The parse is attempted and reported separately from the request,
 * so "the model answered but the JSON is wrong" is distinguishable from "the
 * call never landed" — the two have completely different fixes.
 */
export interface RawGeneration {
  ok: boolean;
  provider: Provider;
  providerLabel: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  /** Present when the call succeeded. */
  stopReason?: string | null;
  usage?: unknown;
  text?: string;
  /** Whether the raw text parsed into a valid lesson, and why not if it did not. */
  parsedOk?: boolean;
  parseError?: string;
  /** Present when the call itself failed. */
  error?: string;
  errorStatus?: number;
  errorBody?: string;
}

export async function generateLessonRaw(
  transcript: string,
  options: GenerateLessonOptions = {},
): Promise<RawGeneration> {
  const includeDepth = options.includeDepth ?? false;
  const locale = options.locale ?? DEFAULT_LOCALE;
  const t = getDictionary(locale);
  const config = getAiProviderConfig();

  let system = "";
  let user = "";

  try {
    const result = await requestLesson(transcript, includeDepth, locale);
    system = result.system;
    user = result.userPrompt;

    const textBlock = result.message.content.find(
      (block) => block.type === "text",
    );
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

    let parsedOk = false;
    let parseError: string | undefined;

    try {
      parseLesson(text, t);
      parsedOk = true;
    } catch (error) {
      parseError = error instanceof Error ? error.message : String(error);
    }

    return {
      ok: true,
      provider: config.provider,
      providerLabel: config.label,
      baseUrl: result.config.baseUrl,
      model: result.config.model,
      systemPrompt: system,
      userPrompt: user,
      stopReason: result.message.stop_reason,
      usage: result.message.usage,
      text,
      parsedOk,
      parseError,
    };
  } catch (error) {
    // An SDK error carries the HTTP status and the provider's raw body — the
    // two things that actually identify a misrouted base URL or a bad key.
    const status =
      typeof (error as { status?: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;

    return {
      ok: false,
      provider: config.provider,
      providerLabel: config.label,
      baseUrl: config.baseUrl,
      model: config.model,
      systemPrompt: system || buildSystemPrompt(includeDepth, locale),
      userPrompt: user,
      error: error instanceof Error ? error.message : String(error),
      errorStatus: status,
      errorBody:
        typeof (error as { error?: unknown }).error === "object"
          ? JSON.stringify((error as { error: unknown }).error)
          : undefined,
    };
  }
}
