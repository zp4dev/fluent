import type { GenerateLessonResponse } from "@/types/lesson";

// Dummy data for dev mode (?dev=true). Mirrors the exact JSON shape the
// Claude API returns so the UI can be tested without spending API credits.
export const SAMPLE_LESSON: GenerateLessonResponse = {
  videoId: "dQw4w9WgXcQ",
  lesson: {
    title: "Bài học mẫu: Giao tiếp hằng ngày",
    // Spread across the scale on purpose: dev mode is where the chip colours
    // get looked at, and one level would only ever show one of them.
    level: "B1",
    levelNote:
      "Video dùng từ vựng đời thường và câu ngắn, nhưng có vài thành ngữ nên hợp với người ở trình độ B1 trở lên.",
    summary:
      "Bài học này giúp bạn học các từ vựng và cụm từ thông dụng trong giao tiếp tiếng Anh hằng ngày. Bạn sẽ làm quen với cách diễn đạt tự nhiên, một vài thành ngữ phổ biến, và luyện tập qua các câu ví dụ cùng bài kiểm tra ngắn. Đây là nội dung mẫu dùng để kiểm tra giao diện mà không cần gọi API.",
    vocabulary: [
      {
        word: "reliable",
        partOfSpeech: "adjective",
        cefr: "B2",
        definitionEn: "Able to be trusted to do something well.",
        definitionVi: "Có thể tin tưởng để làm tốt một việc gì đó.",
        vietnamese: "đáng tin cậy",
        meanings: [
          {
            definition: "Consistently good in quality or performance; trustworthy.",
            example: "She is a reliable friend who always keeps her promises.",
            vietnamese: "Cô ấy là một người bạn đáng tin cậy, luôn giữ lời hứa.",
          },
          {
            definition: "Likely to be accurate or correct (of information).",
            example: "We need a reliable source for this data.",
            vietnamese: "Chúng ta cần một nguồn đáng tin cậy cho dữ liệu này.",
          },
        ],
        collocations: ["a reliable source", "highly reliable", "a reliable friend"],
        wordFamily: [
          { word: "rely", partOfSpeech: "verb" },
          { word: "reliability", partOfSpeech: "noun" },
          { word: "reliably", partOfSpeech: "adverb" },
        ],
      },
      {
        word: "overwhelmed",
        partOfSpeech: "adjective",
        cefr: "C1",
        definitionEn: "Feeling that you have too much to deal with.",
        definitionVi: "Cảm giác có quá nhiều thứ phải xử lý.",
        vietnamese: "choáng ngợp, quá tải",
        meanings: [
          {
            definition: "Overcome by a strong emotion or too many tasks.",
            example: "I felt overwhelmed by all the new information.",
            vietnamese: "Tôi cảm thấy choáng ngợp bởi tất cả thông tin mới.",
          },
        ],
        collocations: ["feel overwhelmed", "completely overwhelmed"],
        wordFamily: [
          { word: "overwhelm", partOfSpeech: "verb" },
          { word: "overwhelming", partOfSpeech: "adjective" },
        ],
      },
      {
        word: "approach",
        partOfSpeech: "noun",
        cefr: "B1",
        definitionEn: "A way of dealing with a situation or problem.",
        definitionVi: "Một cách để xử lý một tình huống hoặc vấn đề.",
        vietnamese: "cách tiếp cận, phương pháp",
        meanings: [
          {
            definition: "A particular way of dealing with something.",
            example: "We need a different approach to solve this.",
            vietnamese: "Chúng ta cần một cách tiếp cận khác để giải quyết việc này.",
          },
          {
            definition: "To come near or nearer to something (verb).",
            example: "As we approached the station, it started to rain.",
            vietnamese: "Khi chúng tôi đến gần nhà ga, trời bắt đầu mưa.",
          },
        ],
        collocations: ["a new approach", "take an approach", "approach a problem"],
        wordFamily: [{ word: "approachable", partOfSpeech: "adjective" }],
      },
      {
        word: "genuine",
        partOfSpeech: "adjective",
        cefr: "C2",
        definitionEn: "Real and exactly what it appears to be; sincere.",
        definitionVi: "Thật và đúng như vẻ ngoài; chân thành.",
        vietnamese: "chân thật, thật lòng",
        meanings: [
          {
            definition: "Sincere and honest.",
            example: "He showed genuine interest in the project.",
            vietnamese: "Anh ấy thể hiện sự quan tâm chân thật với dự án.",
          },
        ],
        collocations: ["genuine interest", "a genuine smile"],
        wordFamily: [{ word: "genuinely", partOfSpeech: "adverb" }],
      },
      {
        word: "efficient",
        partOfSpeech: "adjective",
        cefr: "B2",
        definitionEn: "Working in a well-organized way without wasting time.",
        definitionVi: "Làm việc một cách có tổ chức, không lãng phí thời gian.",
        vietnamese: "hiệu quả",
        meanings: [
          {
            definition: "Achieving maximum productivity with minimum wasted effort.",
            example: "This is a more efficient way to get things done.",
            vietnamese: "Đây là cách hiệu quả hơn để hoàn thành công việc.",
          },
        ],
        collocations: ["highly efficient", "an efficient system"],
        wordFamily: [
          { word: "efficiency", partOfSpeech: "noun" },
          { word: "efficiently", partOfSpeech: "adverb" },
        ],
      },
      {
        word: "curious",
        partOfSpeech: "adjective",
        cefr: "A2",
        definitionEn: "Eager to know or learn something.",
        definitionVi: "Háo hức muốn biết hoặc học hỏi điều gì đó.",
        vietnamese: "tò mò, ham học hỏi",
        meanings: [
          {
            definition: "Interested in learning about things.",
            example: "She was curious about how the machine worked.",
            vietnamese: "Cô ấy tò mò về cách chiếc máy hoạt động.",
          },
        ],
        collocations: ["curious about", "a curious mind"],
        wordFamily: [
          { word: "curiosity", partOfSpeech: "noun" },
          { word: "curiously", partOfSpeech: "adverb" },
        ],
      },
      {
        word: "encourage",
        partOfSpeech: "verb",
        cefr: "A1",
        definitionEn: "To give someone support or confidence to do something.",
        definitionVi: "Trao cho ai đó sự ủng hộ hoặc tự tin để làm điều gì đó.",
        vietnamese: "khuyến khích, động viên",
        meanings: [
          {
            definition: "To give support, courage, or hope to someone.",
            example: "My teacher encouraged me to try again.",
            vietnamese: "Giáo viên của tôi đã động viên tôi thử lại.",
          },
        ],
        collocations: ["encourage someone to", "strongly encourage"],
        wordFamily: [
          { word: "encouragement", partOfSpeech: "noun" },
          { word: "encouraging", partOfSpeech: "adjective" },
        ],
      },
    ],
    idiomsAndSlang: [
      {
        phrase: "break the ice",
        meaning: "To make people feel more comfortable in a social situation.",
        vietnamese: "phá vỡ sự ngại ngùng ban đầu",
        note: "Thường dùng khi gặp gỡ người mới.",
      },
      {
        phrase: "piece of cake",
        meaning: "Something very easy to do.",
        vietnamese: "dễ như ăn bánh, rất dễ",
        note: "Dùng để nói một việc gì đó rất đơn giản.",
      },
      {
        phrase: "hang in there",
        meaning: "To stay determined during a difficult situation.",
        vietnamese: "cố gắng lên, đừng bỏ cuộc",
      },
      {
        phrase: "on the same page",
        meaning: "To agree about or understand something the same way.",
        vietnamese: "cùng chung quan điểm, hiểu ý nhau",
        note: "Hay dùng trong công việc nhóm.",
      },
    ],
    exampleSentences: [
      {
        sentence: "Let's break the ice with a quick introduction.",
        keyPhrase: "break the ice",
        vietnamese: "Hãy phá vỡ sự ngại ngùng bằng một lời giới thiệu ngắn.",
      },
      {
        sentence: "Don't worry, the test was a piece of cake.",
        keyPhrase: "piece of cake",
        vietnamese: "Đừng lo, bài kiểm tra dễ như ăn bánh.",
      },
      {
        sentence: "We finally got on the same page about the plan.",
        keyPhrase: "on the same page",
        vietnamese: "Cuối cùng chúng tôi đã hiểu ý nhau về kế hoạch.",
      },
    ],
    quiz: [
      {
        question: "Từ 'reliable' có nghĩa là gì?",
        options: ["đáng tin cậy", "lười biếng", "đắt đỏ", "ồn ào"],
        correctAnswer: 0,
        explanation: "'Reliable' nghĩa là đáng tin cậy, có thể trông cậy được.",
      },
      {
        question: "Thành ngữ 'piece of cake' mang ý nghĩa nào?",
        options: [
          "một miếng bánh thật",
          "rất khó khăn",
          "rất dễ dàng",
          "rất đắt tiền",
        ],
        correctAnswer: 2,
        explanation: "'Piece of cake' nghĩa là việc gì đó rất dễ dàng.",
      },
      {
        question: "Chọn câu dùng đúng từ 'overwhelmed':",
        options: [
          "I felt overwhelmed by the workload.",
          "The cake tastes overwhelmed.",
          "She overwhelmed to school.",
          "He is a overwhelmed car.",
        ],
        correctAnswer: 0,
        explanation:
          "'Overwhelmed' là tính từ chỉ cảm giác quá tải: 'I felt overwhelmed by the workload.'",
      },
      {
        question: "'Hang in there' được dùng khi nào?",
        options: [
          "Khi muốn khen ai đó giàu có",
          "Khi động viên ai đó vượt qua khó khăn",
          "Khi từ chối lời mời",
          "Khi hỏi đường",
        ],
        correctAnswer: 1,
        explanation:
          "'Hang in there' dùng để động viên ai đó cố gắng trong lúc khó khăn.",
      },
      {
        question: "Từ nào có nghĩa là 'khuyến khích, động viên'?",
        options: ["efficient", "curious", "encourage", "genuine"],
        correctAnswer: 2,
        explanation: "'Encourage' nghĩa là khuyến khích, động viên ai đó.",
      },
    ],
  },
};
