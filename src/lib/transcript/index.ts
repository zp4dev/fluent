import { UserFacingError } from "@/lib/errors";
import { fetchDirectTranscript } from "@/lib/transcript/direct";
import { fetchProxyTranscript } from "@/lib/transcript/proxy";
import { fetchSupadataTranscript } from "@/lib/transcript/supadata";

type TranscriptStrategy = {
  name: string;
  fetch: (videoId: string) => Promise<string>;
};

function buildStrategies(): TranscriptStrategy[] {
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
        fetch: (videoId) => fetchProxyTranscript(videoId, proxyUrl),
      }
    : null;

  const direct: TranscriptStrategy = {
    name: "direct",
    fetch: fetchDirectTranscript,
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

function deploymentHint(): string {
  if (process.env.VERCEL !== "1") {
    return "";
  }

  return " Thêm SUPADATA_API_KEY (miễn phí 100 lượt/tháng tại supadata.ai) hoặc TRANSCRIPT_PROXY_URL vào biến môi trường Vercel.";
}

export async function fetchTranscriptText(videoId: string): Promise<string> {
  const strategies = buildStrategies();

  if (!strategies.length) {
    throw new UserFacingError(
      `Không có phương thức lấy phụ đề nào được cấu hình.${deploymentHint()}`,
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
      : "Không thể lấy phụ đề từ video này.";

  if (process.env.VERCEL === "1" && !process.env.SUPADATA_API_KEY && !process.env.TRANSCRIPT_PROXY_URL) {
    throw new UserFacingError(
      `YouTube chặn máy chủ Vercel nên không lấy được phụ đề trực tiếp.${deploymentHint()}`,
    );
  }

  throw new UserFacingError(`${baseMessage}${deploymentHint()}`);
}
