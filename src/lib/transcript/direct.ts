import { YoutubeTranscript } from "youtube-transcript";

import { UserFacingError } from "@/lib/errors";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export async function fetchDirectTranscript(
  videoId: string,
  t: Dictionary,
): Promise<string> {
  const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });

  if (!segments.length) {
    throw new UserFacingError(t.api.noSubtitles);
  }

  const text = segments
    .map((segment) => segment.text.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");

  if (!text) {
    throw new UserFacingError(t.api.emptySubtitles);
  }

  return text;
}
