import {
  Document,
  Font,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";

import type { Lesson } from "@/types/lesson";

/*
 * Client-side lesson PDF generator — PARKED / UNUSED.
 *
 * Kept in the repo so work can resume when a usable react-pdf path exists.
 * DownloadPdfButton no longer imports this module.
 *
 * Blocked on:
 * - @react-pdf/renderer 4.x: open bug diegomura/react-pdf#3277 — custom fonts
 *   crash with "unsupported number: ~1.8e21" (font parsing / glyph metrics).
 * - @react-pdf/renderer 3.x: predates that regression but peers React ≤18 only;
 *   incompatible with this app's React 19 without legacy-peer-deps workarounds.
 *
 * When unblocking: dynamic-import this module only on Pro download click
 * (never at render) so free users don't pay the bundle cost.
 */

// --- Fonts -----------------------------------------------------------------
// The default PDF fonts only cover ASCII, so Vietnamese diacritics (ế, ữ, ạ, đ)
// would break. Register Nunito (static TTFs with full Vietnamese coverage) in
// regular + bold. @expo-google-fonts ships stable static TTFs on jsDelivr.
let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) {
    return;
  }
  // Step 3: completely different Vietnamese-capable font (Be Vietnam Pro),
  // self-hosted — to test whether the error is Nunito-specific or broader.
  Font.register({
    family: "BeVietnamPro",
    src: "/fonts/BeVietnamPro-Regular.ttf",
  });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

// --- Palette (mirrors the app) ---------------------------------------------
const COLORS = {
  cream: "#FFF8F0",
  coral: "#FF6766",
  deep: "#CA2851",
  peach: "#FFE3B3",
  amberCard: "#FFF3E0",
  amberSoft: "#FFF0E0",
  border: "#F2D8AE",
  body: "#2D2D2D",
  muted: "#8A7A66",
  writeLine: "#E5CBA3",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.cream,
    fontFamily: "BeVietnamPro",
    fontSize: 11,
    lineHeight: 1.5,
    color: COLORS.body,
    paddingTop: 74,
    paddingBottom: 56,
    paddingHorizontal: 52,
  },

  // Running header / footer (repeat on every page).
  header: {
    position: "absolute",
    top: 26,
    left: 52,
    right: 52,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.peach,
  },
  headerText: {
    fontSize: 9,
    color: COLORS.muted,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: 26,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: COLORS.peach,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 9,
    color: COLORS.muted,
  },

  // Title block.
  brand: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.coral,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: COLORS.deep,
    marginBottom: 12,
  },
  summary: {
    fontSize: 12,
    color: COLORS.body,
    marginBottom: 16,
  },
  sourceRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  sourceLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.muted,
    marginRight: 4,
  },
  sourceLink: {
    fontSize: 10,
    color: COLORS.coral,
  },

  // Section heading.
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.coral,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingBottom: 6,
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.coral,
  },

  // Vocabulary card.
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.amberCard,
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  word: {
    fontSize: 15,
    fontWeight: 700,
    color: COLORS.body,
    marginRight: 8,
  },
  pos: {
    fontSize: 10,
    color: COLORS.muted,
  },
  translation: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.deep,
    marginBottom: 3,
  },
  defEn: {
    fontSize: 11,
    color: COLORS.body,
    marginBottom: 2,
  },
  defVi: {
    fontSize: 10,
    color: COLORS.muted,
    marginBottom: 2,
  },

  depthBlock: {
    marginTop: 8,
  },
  depthLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.coral,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 3,
  },
  meaning: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
  },
  meaningDef: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.body,
    marginBottom: 2,
  },
  meaningEx: {
    fontSize: 10,
    color: COLORS.body,
    marginBottom: 2,
  },
  meaningVi: {
    fontSize: 10,
    color: COLORS.deep,
  },
  chipRow: {
    fontSize: 10,
    color: COLORS.body,
  },
  familyItem: {
    fontSize: 10,
    color: COLORS.body,
    marginBottom: 1,
  },

  // Worksheet writing line under each vocab entry.
  writeLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.writeLine,
    height: 16,
    marginTop: 8,
  },

  // Idioms / grammar generic block.
  block: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.amberSoft,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.body,
    marginBottom: 3,
  },
  blockBody: {
    fontSize: 11,
    color: COLORS.body,
    marginBottom: 2,
  },
  blockVi: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.deep,
    marginBottom: 2,
  },
  blockNote: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 3,
  },

  // Quiz.
  question: {
    marginBottom: 14,
  },
  questionText: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.body,
    marginBottom: 6,
  },
  option: {
    fontSize: 11,
    color: COLORS.body,
    marginBottom: 3,
    marginLeft: 10,
  },
  answerKeyItem: {
    fontSize: 11,
    color: COLORS.body,
    marginBottom: 4,
  },
  answerLetter: {
    fontWeight: 700,
    color: COLORS.deep,
  },
});

const OPTION_LETTERS = ["A", "B", "C", "D"];

function hasArray<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

// ISOLATION: bare-minimum document. If this generates, we add pieces back.
function LessonPdfDocument({
  lesson,
  videoId,
}: {
  lesson: Lesson;
  videoId: string;
}) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>{lesson.title}</Text>
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>learnfluent.app</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>

        {/* Title area */}
        <View>
          <Text style={styles.brand}>Fluent · Bài học tiếng Anh</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.summary}>{lesson.summary}</Text>
          <View style={styles.sourceRow}>
            <Text style={styles.sourceLabel}>Video gốc:</Text>
            <Link
              src={`https://www.youtube.com/watch?v=${videoId}`}
              style={styles.sourceLink}
            >
              {`https://www.youtube.com/watch?v=${videoId}`}
            </Link>
          </View>
        </View>

        {/* TỪ VỰNG — content only, no card styling */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Từ vựng</Text>
          {lesson.vocabulary.map((item, index) => {
            const meanings = hasArray(item.meanings) ? item.meanings : [];
            const collocations = hasArray(item.collocations)
              ? item.collocations
              : [];
            const wordFamily = hasArray(item.wordFamily)
              ? item.wordFamily
              : [];

            return (
              <View key={`vocab-${index}`} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.word}>{item.word}</Text>
                  {item.partOfSpeech ? (
                    <Text style={styles.pos}>{item.partOfSpeech}</Text>
                  ) : null}
                </View>
                {item.vietnamese ? (
                  <Text style={styles.translation}>{item.vietnamese}</Text>
                ) : null}
                {item.definitionEn ? (
                  <Text style={styles.defEn}>{item.definitionEn}</Text>
                ) : null}
                {item.definitionVi ? (
                  <Text style={styles.defVi}>{item.definitionVi}</Text>
                ) : null}

                {meanings.length > 0 ? (
                  <View style={styles.depthBlock}>
                    <Text style={styles.depthLabel}>Nghĩa & ví dụ</Text>
                    {meanings.map((meaning, meaningIndex) => (
                      <View key={`m-${meaningIndex}`} style={styles.meaning}>
                        {meaning.definition ? (
                          <Text style={styles.meaningDef}>
                            {meaning.definition}
                          </Text>
                        ) : null}
                        {meaning.example ? (
                          <Text style={styles.meaningEx}>
                            &ldquo;{meaning.example}&rdquo;
                          </Text>
                        ) : null}
                        {meaning.vietnamese ? (
                          <Text style={styles.meaningVi}>
                            {meaning.vietnamese}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {collocations.length > 0 ? (
                  <View>
                    <Text style={styles.depthLabel}>Cụm từ thường gặp</Text>
                    <Text style={styles.chipRow}>
                      {collocations.join("  •  ")}
                    </Text>
                  </View>
                ) : null}

                {wordFamily.length > 0 ? (
                  <View>
                    <Text style={styles.depthLabel}>Họ từ vựng</Text>
                    {wordFamily.map((relative, familyIndex) => (
                      <Text key={`f-${familyIndex}`} style={styles.familyItem}>
                        {relative.word}
                        {relative.partOfSpeech
                          ? ` (${relative.partOfSpeech})`
                          : ""}
                      </Text>
                    ))}
                  </View>
                ) : null}

                <View style={styles.writeLine} />
              </View>
            );
          })}
        </View>

        {/* THÀNH NGỮ */}
        {hasArray(lesson.idiomsAndSlang) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Thành ngữ</Text>
            {lesson.idiomsAndSlang.map((idiom, index) => (
              <View key={`idiom-${index}`} style={styles.block} wrap={false}>
                <Text style={styles.blockTitle}>{idiom.phrase}</Text>
                {idiom.meaning ? (
                  <Text style={styles.blockBody}>{idiom.meaning}</Text>
                ) : null}
                {idiom.vietnamese ? (
                  <Text style={styles.blockVi}>{idiom.vietnamese}</Text>
                ) : null}
                {idiom.note ? (
                  <Text style={styles.blockNote}>💡 {idiom.note}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* NGỮ PHÁP */}
        {hasArray(lesson.exampleSentences) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Ngữ pháp</Text>
            {lesson.exampleSentences.map((example, index) => (
              <View key={`grammar-${index}`} style={styles.block} wrap={false}>
                <Text style={styles.blockTitle}>Câu {index + 1}</Text>
                <Text style={styles.blockBody}>{example.sentence}</Text>
                {example.vietnamese ? (
                  <Text style={styles.blockVi}>{example.vietnamese}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* KIỂM TRA (printed test — no answers inline) */}
        {hasArray(lesson.quiz) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Kiểm tra</Text>
            {lesson.quiz.map((question, index) => (
              <View key={`quiz-${index}`} style={styles.question} wrap={false}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.question}
                </Text>
                {question.options.map((option, optionIndex) => (
                  <Text key={`opt-${optionIndex}`} style={styles.option}>
                    {OPTION_LETTERS[optionIndex]}. {option}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ĐÁP ÁN (answer key on final page) */}
        {hasArray(lesson.quiz) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Đáp án</Text>
            {lesson.quiz.map((question, index) => {
              const letter = OPTION_LETTERS[question.correctAnswer] ?? "?";
              const answerText = question.options[question.correctAnswer] ?? "";
              return (
                <Text key={`ans-${index}`} style={styles.answerKeyItem}>
                  {index + 1}.{" "}
                  <Text style={styles.answerLetter}>{letter}</Text> —{" "}
                  {answerText}
                </Text>
              );
            })}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LessonPdfDocumentFull({
  lesson,
  videoId,
}: {
  lesson: Lesson;
  videoId: string;
}) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <Document title={lesson.title} author="Fluent">
      <Page size="A4" style={styles.page} wrap>
        {/* Running header + footer */}
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>{lesson.title}</Text>
        </View>
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>learnfluent.app</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>

        {/* Title area */}
        <View>
          <Text style={styles.brand}>Fluent · Bài học tiếng Anh</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.summary}>{lesson.summary}</Text>
          <View style={styles.sourceRow}>
            <Text style={styles.sourceLabel}>Video gốc:</Text>
            <Link src={videoUrl} style={styles.sourceLink}>
              {videoUrl}
            </Link>
          </View>
        </View>

        {/* TỪ VỰNG */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Từ vựng</Text>
          {lesson.vocabulary.map((item, index) => {
            const meanings = hasArray(item.meanings) ? item.meanings : [];
            const collocations = hasArray(item.collocations)
              ? item.collocations
              : [];
            const wordFamily = hasArray(item.wordFamily)
              ? item.wordFamily
              : [];

            return (
              <View key={`vocab-${index}`} style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.word}>{item.word}</Text>
                  {item.partOfSpeech ? (
                    <Text style={styles.pos}>{item.partOfSpeech}</Text>
                  ) : null}
                </View>
                {item.vietnamese ? (
                  <Text style={styles.translation}>{item.vietnamese}</Text>
                ) : null}
                {item.definitionEn ? (
                  <Text style={styles.defEn}>{item.definitionEn}</Text>
                ) : null}
                {item.definitionVi ? (
                  <Text style={styles.defVi}>{item.definitionVi}</Text>
                ) : null}

                {meanings.length > 0 ? (
                  <View style={styles.depthBlock}>
                    <Text style={styles.depthLabel}>Nghĩa & ví dụ</Text>
                    {meanings.map((meaning, meaningIndex) => (
                      <View key={`m-${meaningIndex}`} style={styles.meaning}>
                        {meaning.definition ? (
                          <Text style={styles.meaningDef}>
                            {meaning.definition}
                          </Text>
                        ) : null}
                        {meaning.example ? (
                          <Text style={styles.meaningEx}>
                            &ldquo;{meaning.example}&rdquo;
                          </Text>
                        ) : null}
                        {meaning.vietnamese ? (
                          <Text style={styles.meaningVi}>
                            {meaning.vietnamese}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {collocations.length > 0 ? (
                  <View>
                    <Text style={styles.depthLabel}>Cụm từ thường gặp</Text>
                    <Text style={styles.chipRow}>
                      {collocations.join("  •  ")}
                    </Text>
                  </View>
                ) : null}

                {wordFamily.length > 0 ? (
                  <View>
                    <Text style={styles.depthLabel}>Họ từ vựng</Text>
                    {wordFamily.map((relative, familyIndex) => (
                      <Text key={`f-${familyIndex}`} style={styles.familyItem}>
                        {relative.word}
                        {relative.partOfSpeech
                          ? ` (${relative.partOfSpeech})`
                          : ""}
                      </Text>
                    ))}
                  </View>
                ) : null}

                <View style={styles.writeLine} />
              </View>
            );
          })}
        </View>

        {/* THÀNH NGỮ */}
        {hasArray(lesson.idiomsAndSlang) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Thành ngữ</Text>
            {lesson.idiomsAndSlang.map((idiom, index) => (
              <View key={`idiom-${index}`} style={styles.block} wrap={false}>
                <Text style={styles.blockTitle}>{idiom.phrase}</Text>
                {idiom.meaning ? (
                  <Text style={styles.blockBody}>{idiom.meaning}</Text>
                ) : null}
                {idiom.vietnamese ? (
                  <Text style={styles.blockVi}>{idiom.vietnamese}</Text>
                ) : null}
                {idiom.note ? (
                  <Text style={styles.blockNote}>💡 {idiom.note}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* NGỮ PHÁP */}
        {hasArray(lesson.exampleSentences) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Ngữ pháp</Text>
            {lesson.exampleSentences.map((example, index) => (
              <View key={`grammar-${index}`} style={styles.block} wrap={false}>
                <Text style={styles.blockTitle}>Câu {index + 1}</Text>
                <Text style={styles.blockBody}>{example.sentence}</Text>
                {example.vietnamese ? (
                  <Text style={styles.blockVi}>{example.vietnamese}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* KIỂM TRA (printed test — no answers inline) */}
        {hasArray(lesson.quiz) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Kiểm tra</Text>
            {lesson.quiz.map((question, index) => (
              <View key={`quiz-${index}`} style={styles.question} wrap={false}>
                <Text style={styles.questionText}>
                  {index + 1}. {question.question}
                </Text>
                {question.options.map((option, optionIndex) => (
                  <Text key={`opt-${optionIndex}`} style={styles.option}>
                    {OPTION_LETTERS[optionIndex]}. {option}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {/* ĐÁP ÁN (answer key on final page) */}
        {hasArray(lesson.quiz) ? (
          <View style={styles.section} break>
            <Text style={styles.sectionTitle}>Đáp án</Text>
            {lesson.quiz.map((question, index) => {
              const letter = OPTION_LETTERS[question.correctAnswer] ?? "?";
              const answerText = question.options[question.correctAnswer] ?? "";
              return (
                <Text key={`ans-${index}`} style={styles.answerKeyItem}>
                  {index + 1}.{" "}
                  <Text style={styles.answerLetter}>{letter}</Text> — {answerText}
                </Text>
              );
            })}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFC")
    .replace(/[\\/:*?"<>|]+/g, "")
    .trim();
  return cleaned.length > 0 ? cleaned : "fluent-lesson";
}

/**
 * Generate the lesson PDF and trigger a browser download. Browser-only.
 */
export async function downloadLessonPdf(
  lesson: Lesson,
  videoId: string,
): Promise<void> {
  ensureFonts();

  const blob = await pdf(
    <LessonPdfDocument lesson={lesson} videoId={videoId} />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFileName(lesson.title)}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
