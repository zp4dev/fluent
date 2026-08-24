import {
  Document,
  Font,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";

import type { Lesson } from "@/types/lesson";

/**
 * Client-side lesson PDF generator (Pro only).
 *
 * Dynamic-imported from DownloadPdfButton only after a click, never at
 * render, so free users never pay for @react-pdf/renderer's bundle size.
 * Rendering and the browser download both happen here, entirely client-side —
 * the server's only job is the Pro check + hourly quota in /api/pdf-limit.
 *
 * Quiz questions are intentionally left out of the sheet: they're an
 * on-screen check for the current session, not something worth printing.
 */

// --- Fonts -----------------------------------------------------------------
// The default PDF fonts only cover ASCII, so Vietnamese diacritics (ế, ữ, ạ, đ)
// would break. Be Vietnam Pro ships full Vietnamese coverage; both weights are
// registered so `fontWeight: 700` uses real bold glyphs instead of a
// synthesized one.
let fontsRegistered = false;

function ensureFonts() {
  if (fontsRegistered) {
    return;
  }
  Font.register({
    family: "BeVietnamPro",
    fonts: [
      { src: "/fonts/BeVietnamPro-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/BeVietnamPro-Bold.ttf", fontWeight: 700 },
    ],
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
  thumbnail: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    borderRadius: 8,
    marginBottom: 14,
  },
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
  // CEFR level. Printed as text, never as a colour block: this sheet is meant
  // to be photocopied in black and white by a teacher.
  levelLine: {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.deep,
    marginBottom: 4,
  },
  levelNote: {
    fontSize: 10,
    color: COLORS.muted,
    marginBottom: 12,
  },
  cefr: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.deep,
    marginLeft: 6,
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

  // Vocabulary flashcard.
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
});

function hasArray<T>(value: T[] | undefined | null): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

function LessonPdfDocument({
  lesson,
  videoId,
}: {
  lesson: Lesson;
  videoId: string;
}) {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // hqdefault is generated for essentially every YouTube video (unlike
  // maxresdefault, which many uploads don't have); a broken image URL just
  // renders as blank space, so a fetch failure here never breaks the PDF.
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <Document title={lesson.title} author="Fluent">
      <Page size="A4" style={styles.page} wrap>
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
          {/* react-pdf's Image renders into the PDF, not the DOM — no alt text applies. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={styles.thumbnail} src={thumbnailUrl} />
          <Text style={styles.brand}>Fluent · Bài học tiếng Anh</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.summary}>{lesson.summary}</Text>
          {lesson.level ? (
            <Text style={styles.levelLine}>Trình độ: {lesson.level}</Text>
          ) : null}
          {lesson.levelNote ? (
            <Text style={styles.levelNote}>{lesson.levelNote}</Text>
          ) : null}
          <View style={styles.sourceRow}>
            <Text style={styles.sourceLabel}>Video gốc:</Text>
            <Link src={videoUrl} style={styles.sourceLink}>
              {videoUrl}
            </Link>
          </View>
        </View>

        {/* TỪ VỰNG — one flashcard per word */}
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
                  {item.cefr ? (
                    <Text style={styles.cefr}>{item.cefr}</Text>
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

        {/* NGỮ PHÁP — example sentences, no quiz */}
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
