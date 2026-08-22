import { NextResponse } from "next/server";

import { isAuthorizedAdmin } from "@/lib/adminAuth";
import { generateLessonRaw, type RawGeneration } from "@/lib/anthropic";
import { resolveLocale } from "@/lib/i18n/config";
import { getServerDictionary } from "@/lib/i18n/server";
import { fetchSupadataRaw, type SupadataRaw } from "@/lib/transcript/supadata";
import { extractVideoId } from "@/lib/videoId";
import { getTranscriptText } from "@/lib/youtube";

/**
 * Debug endpoint for /admin-dev: run the pipeline and report each stage raw.
 *
 * Nothing here is rate limited or wrapped in friendly copy, because both would
 * defeat the purpose — an operator debugging a broken stage needs the actual
 * status code and the actual body, not a translated apology. Admin-only for
 * exactly that reason: these responses carry provider errors verbatim.
 */
export const maxDuration = 120;

interface DebugResponse {
  videoId: string;
  supadata:
    | ({ configured: true } & SupadataRaw)
    | { configured: false; reason: string }
    | { configured: true; failed: true; error: string };
  /** Which transcript actually reached the model, and where it came from. */
  transcript: {
    source: "supadata" | "fallback" | "none";
    chars: number;
    preview?: string;
    error?: string;
  };
  ai: RawGeneration | { skipped: true; reason: string };
}

export async function POST(request: Request) {
  let body: {
    url?: string;
    locale?: string;
    includeDepth?: boolean;
    skipAi?: boolean;
    secret?: string;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!(await isAuthorizedAdmin(request, body.secret))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const videoId = extractVideoId(body.url?.trim() ?? "");

  if (!videoId) {
    return NextResponse.json(
      { error: "Could not extract a YouTube video id from that URL." },
      { status: 400 },
    );
  }

  // ---- Stage 1: Supadata, raw -------------------------------------------
  const apiKey = process.env.SUPADATA_API_KEY?.trim();
  let supadata: DebugResponse["supadata"];

  if (!apiKey) {
    supadata = {
      configured: false,
      reason: "SUPADATA_API_KEY is not set in this environment.",
    };
  } else {
    try {
      supadata = { configured: true, ...(await fetchSupadataRaw(videoId, apiKey)) };
    } catch (error) {
      supadata = {
        configured: true,
        failed: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ---- Stage 2: the model, raw ------------------------------------------
  // Fed from Supadata's own output so the two stages line up. When Supadata
  // gave us nothing there is no transcript to send, and calling the model
  // anyway would just burn credits on an empty prompt.
  let transcript = "";
  let source: DebugResponse["transcript"]["source"] = "none";
  let transcriptError: string | undefined;

  if ("body" in supadata && supadata.ok) {
    try {
      const parsed = JSON.parse(supadata.body) as { content?: unknown };
      if (typeof parsed.content === "string" && parsed.content.trim()) {
        transcript = parsed.content.trim();
        source = "supadata";
      }
    } catch {
      // Leave it empty; the raw body is already on screen for inspection.
    }
  }

  // Supadata is stage 1 by name, but it is not the only way to a transcript —
  // and when it is unconfigured or failing, the model stage is usually the
  // thing being debugged. Falling back to the normal strategy chain keeps
  // stage 2 reachable instead of blocking it behind an unrelated outage.
  if (!transcript) {
    try {
      const t = await getServerDictionary();
      transcript = await getTranscriptText(videoId, t);
      source = transcript ? "fallback" : "none";
    } catch (error) {
      transcriptError = error instanceof Error ? error.message : String(error);
    }
  }

  let ai: DebugResponse["ai"];

  if (body.skipAi) {
    ai = { skipped: true, reason: "Skipped at the operator's request." };
  } else if (!transcript) {
    ai = {
      skipped: true,
      reason:
        "No transcript from Supadata or the fallback chain, so the model was not called.",
    };
  } else {
    ai = await generateLessonRaw(transcript, {
      includeDepth: body.includeDepth ?? false,
      locale: resolveLocale(body.locale),
    });
  }

  return NextResponse.json({
    videoId,
    supadata,
    transcript: {
      source,
      chars: transcript.length,
      preview: transcript ? transcript.slice(0, 2000) : undefined,
      error: transcriptError,
    },
    ai,
  } satisfies DebugResponse);
}
