import type { Dictionary } from "@/lib/i18n/dictionaries";
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

const MAX_TRANSCRIPT_CHARS = 14_000;

export function truncateTranscript(text: string): string {
  if (text.length <= MAX_TRANSCRIPT_CHARS) {
    return text;
  }

  console.log(
    "[youtube] Truncating transcript from",
    text.length,
    "to",
    MAX_TRANSCRIPT_CHARS,
    "chars",
  );

  return `${text.slice(0, MAX_TRANSCRIPT_CHARS)}\n\n[Transcript truncated due to length.]`;
}
