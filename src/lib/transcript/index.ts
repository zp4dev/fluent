import { UserFacingError } from "@/lib/errors";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { fetchDirectTranscript } from "@/lib/transcript/direct";
import { fetchProxyTranscript } from "@/lib/transcript/proxy";
import { fetchSupadataTranscript } from "@/lib/transcript/supadata";

type TranscriptStrategy = {
  name: string;
  fetch: (videoId: string) => Promise<string>;
};

function buildStrategies(t: Dictionary): TranscriptStrategy[] {
  const isVercel = process.env.VERCEL === "1";
  const supadataKey = process.env.SUPADATA_API_KEY?.trim();
  const proxyUrl = process.env.TRANSCRIPT_PROXY_URL?.trim();

  const supadata: TranscriptStrategy | null = supadataKey
    ? {
        name: "supadata",
        fetch: (videoId) => fetchSupadataTranscript(videoId, supadataKey),
      }
    : null;

  const proxy: TranscriptStrategy | null = proxyUrl
    ? {
        name: "proxy",
        fetch: (videoId) => fetchProxyTranscript(videoId, proxyUrl, t),
      }
    : null;

  const direct: TranscriptStrategy = {
    name: "direct",
    fetch: (videoId) => fetchDirectTranscript(videoId, t),
  };

  // YouTube blocks cloud provider IPs (including Vercel). Prefer external providers there.
  if (isVercel) {
    return [supadata, proxy, direct].filter(
      (strategy): strategy is TranscriptStrategy => strategy !== null,
    );
  }

  return [direct, supadata, proxy].filter(
    (strategy): strategy is TranscriptStrategy => strategy !== null,
  );
}

function deploymentHint(t: Dictionary): string {
  if (process.env.VERCEL !== "1") {
    return "";
  }

  return t.api.deploymentHint;
}

export async function fetchTranscriptText(
  videoId: string,
  t: Dictionary,
): Promise<string> {
  const strategies = buildStrategies(t);

  if (!strategies.length) {
    throw new UserFacingError(
      `${t.api.noTranscriptMethod}${deploymentHint(t)}`,
    );
  }

  let lastError: Error | null = null;

  for (const strategy of strategies) {
    try {
      console.log("[youtube] Trying transcript strategy:", strategy.name);
      const text = await strategy.fetch(videoId);
      console.log(
        "[youtube] Transcript fetched via",
        strategy.name,
        "length:",
        text.length,
      );
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `[youtube] Strategy "${strategy.name}" failed:`,
        lastError.message,
      );
    }
  }

  // Only a message written for the reader may be forwarded. A provider error
  // like `Supadata error (429): {...}` carries their raw response body, so it
  // is logged above and replaced here.
  const baseMessage =
    lastError instanceof UserFacingError
      ? lastError.message
      : t.api.transcriptFailed;

  if (process.env.VERCEL === "1" && !process.env.SUPADATA_API_KEY && !process.env.TRANSCRIPT_PROXY_URL) {
    throw new UserFacingError(
      `${t.api.vercelBlocked}${deploymentHint(t)}`,
    );
  }

  throw new UserFacingError(`${baseMessage}${deploymentHint(t)}`);
}
