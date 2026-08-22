import { YoutubeTranscript } from "youtube-transcript";

import { UserFacingError } from "@/lib/errors";

export async function fetchDirectTranscript(videoId: string): Promise<string> {
  const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });

  if (!segments.length) {
    throw new UserFacingError("Video này không có phụ đề tiếng Anh.");
  }

  const text = segments
    .map((segment) => segment.text.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");

  if (!text) {
    throw new UserFacingError("Phụ đề của video này trống.");
  }

  return text;
}
