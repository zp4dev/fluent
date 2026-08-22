import { NextResponse } from "next/server";

import { generateLesson } from "@/lib/anthropic";
import { readSession } from "@/lib/authSession";
import { UserFacingError } from "@/lib/errors";
import { getServerDictionary, getServerLocale } from "@/lib/i18n/server";
import { isMaintenanceMode } from "@/lib/maintenance";
import { isProUser } from "@/lib/pro";
import {
  PRO_DAILY_LIMIT_CODE,
  checkProDailyLimit,
  getProDailyIdentifier,
} from "@/lib/proDailyLimit";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";
import { countLessonGenerated } from "@/lib/userAdmin";
import {
  extractVideoId,
  getTranscriptText,
  truncateTranscript,
} from "@/lib/youtube";

/**
 * Fetching a transcript can poll a provider for up to ~30s, and generation is
 * a non-streaming Claude call on top of that. Without this the route inherits
 * the platform default and gets cut off mid-request on longer videos.
 */
export const maxDuration = 120;

export async function POST(request: Request) {
  // The locale cookie decides two things at once: what language the lesson is
  // written in, and what language these errors come back in. Read once, up
  // front, so a failure before generation is still in the reader's language.
  const locale = await getServerLocale();
  const t = await getServerDictionary();

  try {
    if (isMaintenanceMode()) {
      console.log("[generate-lesson] Blocked — maintenance mode is on");
      return NextResponse.json(
        { error: t.api.maintenance },
        { status: 503 },
      );
    }

    const body = (await request.json()) as {
      url?: string;
      licenseKey?: string;
    };
    const url = body.url?.trim();

    // Identity comes from the signed session cookie. An `email` in the body is
    // ignored entirely — that it used to be trusted is what let anyone with a
    // customer's address use their Pro.
    const session = await readSession();

    console.log("[generate-lesson] Request received, URL:", url ?? "(empty)");

    if (!url) {
      return NextResponse.json(
        { error: t.api.missingUrl },
        { status: 400 },
      );
    }

    const videoId = extractVideoId(url);

    if (!videoId) {
      console.log("[generate-lesson] Invalid URL — no video ID extracted");
      return NextResponse.json(
        { error: t.api.invalidUrl },
        { status: 400 },
      );
    }

    console.log("[generate-lesson] Video ID:", videoId);

    // Rate limit by IP BEFORE any Supadata/Anthropic work so we block the
    // expensive calls, not just the response.
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.success) {
      console.log("[generate-lesson] Rate limit exceeded for IP:", ip);
      return NextResponse.json(
        { error: t.api.rateLimited },
        { status: 429 },
      );
    }

    // Pro on either path: an entitlement for the *verified* address, or a
    // grandfathered license key held in the browser.
    const includeDepth = await isProUser({
      email: session?.email,
      licenseKey: body.licenseKey,
    });

    // Quiet fair-use cap for every Pro path (paid + grandfathered). Free users
    // keep the client-side 3/day counter; this only runs for Pro.
    if (includeDepth) {
      const identifier =
        getProDailyIdentifier({
          email: session?.email,
          licenseKey: body.licenseKey,
        }) ?? `ip:${ip}`;

      const proDaily = await checkProDailyLimit(identifier);

      if (!proDaily.success) {
        console.log(
          `[generate-lesson] Pro daily limit exceeded for ${identifier}`,
        );
        return NextResponse.json(
          {
            error: t.api.proDailyLimit,
            code: PRO_DAILY_LIMIT_CODE,
          },
          { status: 429 },
        );
      }
    }

    const rawTranscript = await getTranscriptText(videoId, t);
    const transcript = truncateTranscript(rawTranscript);

    console.log(
      `[generate-lesson] Generating lesson with Claude (tier: ${
        includeDepth ? "pro" : "free"
      }, locale: ${locale})...`,
    );
    const lesson = await generateLesson(transcript, { includeDepth, locale });
    console.log("[generate-lesson] Lesson generated successfully");

    // Only signed-in users have an address to attribute this to; anonymous
    // free-tier generations are not counted. Never throws, so it cannot cost
    // the user a lesson we have already paid Claude for.
    await countLessonGenerated(session?.email);

    return NextResponse.json({ lesson, videoId });
  } catch (error) {
    console.error("[generate-lesson] Failed:", error);

    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    // Anything else can carry internal detail — a provider's raw response
    // body, an SDK error, a missing env var — so it never reaches the client.
    return NextResponse.json(
      { error: t.api.generateFailed },
      { status: 500 },
    );
  }
}
