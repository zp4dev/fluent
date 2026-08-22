import Anthropic from "@anthropic-ai/sdk";

import { UserFacingError } from "@/lib/errors";
import type { Lesson } from "@/types/lesson";

// Depth fields (meanings, collocations, wordFamily) are Pro-only. They are kept
// in a single block here so the free-tier prompt can omit them cleanly, and so
// the paid feature can be toggled server-side via `includeDepth`.
const VOCAB_DEPTH_SCHEMA = `,
      "meanings": [
        {
          "definition": "English definition for this specific sense of the word",
          "example": "English example sentence using the word in this sense",
          "vietnamese": "Vietnamese translation of the example sentence"
        }
      ],
      "collocations": ["common English collocation or phrase using the word", "another collocation"],
      "wordFamily": [
        { "word": "related English word form", "partOfSpeech": "English part of speech" }
      ]`;

const VOCAB_DEPTH_LANGUAGE_RULE =
  "\n- meanings.definition, meanings.example, collocations, and wordFamily.word/partOfSpeech MUST be in English (the content being taught); meanings.vietnamese MUST be in Vietnamese";

const VOCAB_DEPTH_REQUIREMENTS = `

Vocabulary DEPTH fields (meanings, collocations, wordFamily) — ALWAYS include them for this (Pro) lesson:
- meanings: include one entry per common meaning of the word. If the word has multiple common meanings, include multiple entries; otherwise include exactly one. Each meaning needs an English definition, an English example sentence, and a Vietnamese translation of that example.
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

function buildSystemPrompt(includeDepth: boolean): string {
  const depthRequirements = includeDepth
    ? VOCAB_DEPTH_REQUIREMENTS
    : VOCAB_PREVIEW_REQUIREMENTS;

  return `You are an expert English teacher creating lessons for Vietnamese speakers.

Given a YouTube video transcript, produce a structured English lesson as valid JSON only — no markdown, no code fences, no extra text.

The JSON must match this schema exactly:
{
  "title": "short lesson title in Vietnamese",
  "summary": "2-3 sentence overview entirely in Vietnamese describing what English skills and topics the learner will study",
  "vocabulary": [
    {
      "word": "English word or phrase from the transcript",
      "partOfSpeech": "English part of speech, e.g. noun, verb, adjective, phrasal verb",
      "definitionEn": "a clear, concise English definition of the word",
      "definitionVi": "clear explanation in Vietnamese of what the English word/phrase means",
      "vietnamese": "Vietnamese translation or equivalent"${VOCAB_DEPTH_SCHEMA}
    }
  ],
  "idiomsAndSlang": [
    {
      "phrase": "English idiom, slang, or colloquial expression",
      "meaning": "explanation in Vietnamese of what it means",
      "vietnamese": "Vietnamese equivalent or paraphrase",
      "note": "optional usage note in Vietnamese"
    }
  ],
  "exampleSentences": [
    {
      "sentence": "English example sentence using a key phrase",
      "keyPhrase": "the highlighted English phrase",
      "vietnamese": "Vietnamese translation of the sentence"
    }
  ],
  "quiz": [
    {
      "question": "quiz question in Vietnamese",
      "options": ["Vietnamese option A", "Vietnamese option B", "Vietnamese option C", "Vietnamese option D"],
      "correctAnswer": 0,
      "explanation": "explanation in Vietnamese"
    }
  ]
}

Language rules:
- title and summary MUST be entirely in Vietnamese
- vocabulary.word, partOfSpeech, and definitionEn MUST be in English (the content being taught)
- idiomsAndSlang.phrase and exampleSentences.sentence MUST be in English (the content being taught)
- definitionVi, vietnamese, idiom meanings, notes, quiz questions, and explanations MUST be in Vietnamese${VOCAB_DEPTH_LANGUAGE_RULE}

Requirements:
- Include 8-12 vocabulary items drawn from the transcript
- For each vocabulary item, partOfSpeech, definitionEn, definitionVi, and vietnamese are ALWAYS required
- Include 3-6 idioms or slang expressions (use [] if none appear)
- Include exactly 3 example sentences using key phrases from the lesson
- Include exactly 5 quiz questions with 4 options each
- correctAnswer must be the 0-based index of the correct option
- Use simple, learner-friendly Vietnamese for all Vietnamese text${depthRequirements}

CRITICAL — Quiz rules:
- NEVER ask about the video's story, plot, events, people, places, times, or factual details (e.g. "mấy giờ họ thức dậy?", "họ đi đâu?", "chuyện gì xảy ra tiếp theo?")
- ALL quiz questions MUST test English language knowledge only: vocabulary meanings, grammar usage, idiom/slang meanings, choosing the correct word/phrase, fill-in-the-blank, or identifying correct usage
- Every question must test whether the learner understands an English word, phrase, or grammar pattern from THIS lesson
- Quiz question text must be in Vietnamese; quiz answer options must ALL be in Vietnamese (they are translations/explanations of the English word being tested)
- Good example: "Từ 'break the ice' có nghĩa là gì?" with English idiom options
- Bad example: "Trong video, họ đi đâu sau bữa sáng?"`;
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  return trimmed;
}

function parseLesson(raw: string): Lesson {
  const parsed = JSON.parse(stripJsonFences(raw)) as Lesson;

  if (!parsed.title || !parsed.vocabulary?.length || parsed.quiz?.length !== 5) {
    throw new UserFacingError("Claude trả về cấu trúc bài học không đầy đủ.");
  }

  if (parsed.exampleSentences?.length !== 3) {
    throw new UserFacingError("Claude trả về số câu ví dụ không hợp lệ.");
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
    throw new UserFacingError("Claude trả về câu hỏi trắc nghiệm không hợp lệ.");
  }

  return parsed;
}

interface GenerateLessonOptions {
  /**
   * When true, generate the richer Pro-tier vocabulary (meanings,
   * collocations, word family). Free tier omits these depth fields.
   */
  includeDepth?: boolean;
}

export async function generateLesson(
  transcript: string,
  options: GenerateLessonOptions = {},
): Promise<Lesson> {
  const includeDepth = options.includeDepth ?? false;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Chưa cấu hình ANTHROPIC_API_KEY.");
  }

  const client = new Anthropic({ apiKey });

  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

  const message = await client.messages.create({
    model,
    // Larger output budget for the richer Pro vocabulary schema (meanings,
    // collocations, word family). Free tier is a bit higher than base to fit
    // the one full-depth "Pro preview" item.
    max_tokens: includeDepth ? 8192 : 5120,
    system: buildSystemPrompt(includeDepth),
    messages: [
      {
        role: "user",
        content: `Create an English lesson for Vietnamese speakers from this YouTube transcript:\n\n${transcript}`,
      },
    ],
  });

  console.log("[USAGE]", JSON.stringify(message.usage));

  // Check why generation stopped BEFORE parsing. A response cut off at
  // max_tokens is truncated mid-JSON, which would otherwise surface as an
  // opaque "Unexpected end of JSON input".
  if (message.stop_reason === "max_tokens") {
    throw new UserFacingError(
      "Bài học dài quá mức cho phép. Bạn thử một video ngắn hơn nhé.",
    );
  }

  if (message.stop_reason === "refusal") {
    throw new UserFacingError(
      "Nội dung video này không tạo được bài học. Bạn thử video khác nhé.",
    );
  }

  const textBlock = message.content.find((block) => block.type === "text");

  if (!textBlock || textBlock.type !== "text") {
    throw new UserFacingError("Claude không trả về nội dung văn bản.");
  }

  return parseLesson(textBlock.text);
}
