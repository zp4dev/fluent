import Anthropic from "@anthropic-ai/sdk";

import { getAiProviderConfig, type Provider } from "@/lib/aiProvider";

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
      "meanings": [
        {
          "definition": "English definition for this specific sense of the word",
          "example": "English example sentence using the word in this sense",
          "vietnamese": "${lang} translation of the example sentence"
        }
      ],
      "collocations": ["common English collocation or phrase using the word", "another collocation"],
      "wordFamily": [
        { "word": "related English word form", "partOfSpeech": "English part of speech" }
      ]`;

const vocabDepthLanguageRule = (lang: string) =>
  `\n- meanings.definition, meanings.example, collocations, and wordFamily.word/partOfSpeech MUST be in English (the content being taught); meanings.vietnamese MUST be in ${lang}`;

const vocabDepthRequirements = (lang: string) => `

Vocabulary DEPTH fields (meanings, collocations, wordFamily) — ALWAYS include them for this (Pro) lesson:
- meanings: include one entry per common meaning of the word. If the word has multiple common meanings, include multiple entries; otherwise include exactly one. Each meaning needs an English definition, an English example sentence, and a ${lang} translation of that example.
- collocations: 2-4 common English collocations or set phrases that use the word (English only)
- wordFamily: related English word forms with their part of speech (e.g. "develop" -> "development" (noun), "developer" (noun), "developing" (adjective)). Use [] only if there are no natural related forms.`;

// Free tier: give a single item full depth as a "Pro preview"; all others keep
// only the base fields.
const VOCAB_PREVIEW_REQUIREMENTS = `

Vocabulary DEPTH fields (meanings, collocations, wordFamily) — for THIS lesson, include them for EXACTLY ONE vocabulary item as a preview of the Pro version:
- Choose the SINGLE word that benefits MOST from depth: one that has multiple common meanings, real collocations, and related word forms (a word family).
- For that ONE item only, fully populate: meanings (one entry per common meaning), collocations (2-4 common phrases), and wordFamily (related forms with part of speech).
- For ALL OTHER vocabulary items, OMIT meanings, collocations, and wordFamily entirely (either leave those keys out or set them to empty arrays []).
- Exactly one item — no more, no fewer — may contain populated depth fields.`;

/**
 * When the learner's language IS English, "translate into the learner's
 * language" is a contradiction — so those fields become plain-English glosses
 * instead, which is what an English-speaking learner actually wants.
 */
const SAME_LANGUAGE_NOTE = `

NOTE — the learner's language is English, the same language being taught: for the learner-language fields (definitionVi, vietnamese, meanings.vietnamese, idiom meanings and notes, quiz questions, options and explanations) write clear, simpler English paraphrases and synonyms rather than a translation. Never leave them empty and never repeat definitionEn verbatim.`;

function buildSystemPrompt(includeDepth: boolean, locale: Locale): string {
  const lang = LOCALE_INFO[locale].promptName;
  const depthRequirements = includeDepth
    ? vocabDepthRequirements(lang)
    : VOCAB_PREVIEW_REQUIREMENTS;
  const sameLanguageNote = locale === "en" ? SAME_LANGUAGE_NOTE : "";

  return `You are an expert English teacher creating lessons for ${lang} speakers.

Given a YouTube video transcript, produce a structured English lesson as valid JSON only — no markdown, no code fences, no extra text.

The JSON must match this schema exactly:
{
  "title": "short lesson title in ${lang}",
  "summary": "2-3 sentence overview entirely in ${lang} describing what English skills and topics the learner will study",
  "vocabulary": [
    {
      "word": "English word or phrase from the transcript",
      "partOfSpeech": "English part of speech, e.g. noun, verb, adjective, phrasal verb",
      "definitionEn": "a clear, concise English definition of the word",
      "definitionVi": "clear explanation in ${lang} of what the English word/phrase means",
      "vietnamese": "${lang} translation or equivalent"${vocabDepthSchema(lang)}
    }
  ],
  "idiomsAndSlang": [
    {
      "phrase": "English idiom, slang, or colloquial expression",
      "meaning": "explanation in ${lang} of what it means",
      "vietnamese": "${lang} equivalent or paraphrase",
      "note": "optional usage note in ${lang}"
    }
  ],
  "exampleSentences": [
    {
      "sentence": "English example sentence using a key phrase",
      "keyPhrase": "the highlighted English phrase",
      "vietnamese": "${lang} translation of the sentence"
    }
  ],
  "quiz": [
    {
      "question": "quiz question in ${lang}",
      "options": ["${lang} option A", "${lang} option B", "${lang} option C", "${lang} option D"],
      "correctAnswer": 0,
      "explanation": "explanation in ${lang}"
    }
  ]
}

Language rules:
- title and summary MUST be entirely in ${lang}
- vocabulary.word, partOfSpeech, and definitionEn MUST be in English (the content being taught)
- idiomsAndSlang.phrase and exampleSentences.sentence MUST be in English (the content being taught)
- definitionVi, vietnamese, idiom meanings, notes, quiz questions, and explanations MUST be in ${lang} (these keys are named after Vietnamese for legacy reasons — always fill them in ${lang})${vocabDepthLanguageRule(lang)}

Requirements:
- Include 8-12 vocabulary items drawn from the transcript
- For each vocabulary item, partOfSpeech, definitionEn, definitionVi, and vietnamese are ALWAYS required
- Include 3-6 idioms or slang expressions (use [] if none appear)
- Include exactly 3 example sentences using key phrases from the lesson
- Include exactly 5 quiz questions with 4 options each
- correctAnswer must be the 0-based index of the correct option
- Use simple, learner-friendly ${lang} for all ${lang} text${sameLanguageNote}${depthRequirements}

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

  return parsed;
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

  const { message } = await requestLesson(transcript, includeDepth, locale);

  console.log("[USAGE]", JSON.stringify(message.usage));

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
