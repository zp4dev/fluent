"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import LessonDisplay from "@/components/LessonDisplay";
import SavedLessons from "@/components/SavedLessons";
import { CHECKOUT_URL } from "@/lib/checkout";
import { isMaintenanceMode } from "@/lib/maintenance";
import { SAMPLE_LESSON } from "@/lib/sampleLesson";
import {
  deleteSavedLesson,
  getSavedIndex,
  getSavedLesson,
  saveLesson,
  type SavedLessonMeta,
} from "@/lib/savedLessons";
import { animatedScrollToElement } from "@/lib/smoothScroll";
import { DAILY_LIMIT, useDailyLimit } from "@/lib/useDailyLimit";
import { useProStatus } from "@/lib/useProStatus";
import { extractVideoId } from "@/lib/videoId";
import type { GenerateLessonResponse } from "@/types/lesson";

type LicenseStatus = "idle" | "validating" | "error";

export default function LessonGenerator() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateLessonResponse | null>(null);
  const [devMode, setDevMode] = useState(false);

  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [licenseInput, setLicenseInput] = useState("");
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>("idle");
  const [licenseError, setLicenseError] = useState<string | null>(null);

  const [savedIndex, setSavedIndex] = useState<SavedLessonMeta[]>([]);
  const [scrollToResult, setScrollToResult] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const { remaining, limitReached, hydrated, increment } = useDailyLimit();
  // Pro if EITHER a license key or a manually activated order says so.
  const {
    licenseKey,
    email: buyerEmail,
    isPro,
    hydrated: licenseHydrated,
    activate,
  } = useProStatus();

  const maintenance = isMaintenanceMode();
  const blockedByLimit = !devMode && !isPro && limitReached;
  const inputDisabled = maintenance || blockedByLimit;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "true") {
      setDevMode(true);
      setResult(SAMPLE_LESSON);
    }

    // Load the saved-lessons index (localStorage is browser-only).
    setSavedIndex(getSavedIndex());
  }, []);

  // Smooth-scroll to the lesson once it has rendered after a saved selection.
  // Uses a slower custom animation (ease-out, ~700ms) that respects
  // prefers-reduced-motion, so the movement is easy to follow.
  useEffect(() => {
    if (scrollToResult && result && resultRef.current) {
      animatedScrollToElement(resultRef.current, 16, 700);
      setScrollToResult(false);
    }
  }, [scrollToResult, result]);

  function handleSelectSaved(videoId: string) {
    const saved = getSavedLesson(videoId);
    if (!saved) {
      // Entry is missing/corrupt — drop it from the index.
      setSavedIndex(deleteSavedLesson(videoId));
      return;
    }
    setError(null);
    setLoading(false);
    setResult(saved);
    setScrollToResult(true);
  }

  function handleDeleteSaved(videoId: string) {
    setSavedIndex(deleteSavedLesson(videoId));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (maintenance) {
      return;
    }

    // Dev mode: skip the Claude API and load dummy data (no credits used).
    if (devMode) {
      setError(null);
      setResult(SAMPLE_LESSON);
      return;
    }

    // If we already have this lesson saved, load it from storage instead of
    // re-paying Supadata + Claude for a repeat video.
    const videoId = extractVideoId(url);
    if (videoId) {
      const cached = getSavedLesson(videoId);
      if (cached) {
        setError(null);
        setResult(cached);
        return;
      }
    }

    if (blockedByLimit) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the license key so the server can unlock Pro vocabulary depth.
        body: JSON.stringify({
          url,
          licenseKey: licenseKey ?? undefined,
          email: buyerEmail || undefined,
        }),
      });

      const data = (await response.json()) as GenerateLessonResponse & {
        error?: string;
      };

      if (response.status === 429) {
        throw new Error(
          data.error ??
            "Bạn đã tạo quá nhiều bài học trong một giờ qua. Vui lòng thử lại sau ít phút nhé! ⏳",
        );
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Không thể tạo bài học.");
      }

      setResult(data);
      // Persist the freshly generated lesson (and refresh the list).
      setSavedIndex(saveLesson(data));
      if (!isPro) {
        increment();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể tạo bài học.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLicenseSubmit() {
    const key = licenseInput.trim();
    if (!key) {
      return;
    }

    setLicenseStatus("validating");
    setLicenseError(null);

    try {
      const response = await fetch("/api/validate-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key }),
      });

      const data = (await response.json()) as {
        valid?: boolean;
        error?: string;
      };

      if (!response.ok || !data.valid) {
        throw new Error(data.error ?? "Mã không hợp lệ hoặc đã hết hạn.");
      }

      activate(key);
      setShowLicenseInput(false);
      setLicenseInput("");
      setLicenseStatus("idle");
    } catch (validateError) {
      setLicenseStatus("error");
      setLicenseError(
        validateError instanceof Error
          ? validateError.message
          : "Không thể xác thực mã.",
      );
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-10 px-5 py-12 sm:px-6">
      <header className="relative space-y-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Fluent"
          className="mx-auto mb-2 h-16 w-auto"
          style={{ filter: "drop-shadow(0 0 20px rgba(255, 103, 102, 0.3))" }}
        />
        <h1 className="text-4xl font-extrabold tracking-tight text-heading">
          Fluent
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-body">
          Biến mọi video YouTube thành bài học tiếng Anh
        </p>
        {devMode ? (
          <span className="mx-auto flex w-fit items-center gap-1 rounded-full border-2 border-primary bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
            🛠️ Dev mode — dữ liệu mẫu
          </span>
        ) : null}
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <label
          htmlFor="youtube-url"
          className="block text-sm font-extrabold uppercase tracking-wide text-body"
        >
          Liên kết YouTube
        </label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            id="youtube-url"
            type="url"
            required={!devMode}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Dán link YouTube vào đây..."
            disabled={inputDisabled}
            className="min-w-0 flex-1 rounded-2xl border-2 border-border bg-background px-4 py-4 text-base font-semibold text-heading outline-none placeholder:text-muted transition ease-smooth focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={
              loading || maintenance || (!devMode && !url.trim()) || blockedByLimit
            }
            className="btn-3d cursor-pointer rounded-2xl bg-primary px-10 py-5 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {maintenance
              ? "Tạm dừng"
              : loading
                ? "Đang tạo bài học..."
                : "Bắt đầu"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-body sm:text-left">
          {maintenance
            ? "Tính năng tạo bài học đang tạm dừng để nâng cấp. Quay lại sau ít phút nhé!"
            : "Hoạt động tốt nhất với video có phụ đề tiếng Anh."}
        </p>

        {hydrated && licenseHydrated ? (
          isPro ? (
            <p className="mt-2 flex items-center gap-1 text-center text-xs font-bold text-primary sm:text-left">
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-primary bg-highlight px-3 py-1">
                ☕ Pro — không giới hạn
              </span>
            </p>
          ) : (
            <p className="mt-2 text-center text-xs font-bold text-primary sm:text-left">
              Còn lại: {remaining}/{DAILY_LIMIT} lượt hôm nay
            </p>
          )
        ) : null}

        {!isPro ? (
          <div className="mt-4 border-t border-border pt-4">
            {showLicenseInput ? (
              <div className="space-y-2">
                <label
                  htmlFor="license-key"
                  className="block text-xs font-bold text-body"
                >
                  Nhập mã ủng hộ của bạn
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="license-key"
                    type="text"
                    value={licenseInput}
                    onChange={(event) => setLicenseInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleLicenseSubmit();
                      }
                    }}
                    placeholder="Dán mã license vào đây..."
                    className="min-w-0 flex-1 rounded-xl border-2 border-border bg-background px-4 py-3 text-sm font-semibold text-heading outline-none placeholder:text-muted transition ease-smooth focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => void handleLicenseSubmit()}
                    disabled={licenseStatus === "validating" || !licenseInput.trim()}
                    className="cursor-pointer rounded-xl bg-primary px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_#CA2851] transition ease-smooth hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {licenseStatus === "validating" ? "Đang kiểm tra..." : "Kích hoạt"}
                  </button>
                </div>
                {licenseError ? (
                  <p className="text-xs font-bold text-wrong">{licenseError}</p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href={CHECKOUT_URL}
                  className="text-xs font-bold text-primary underline-offset-2 transition ease-smooth hover:underline"
                >
                  ☕ Ủng hộ Fluent
                </Link>
                <button
                  type="button"
                  onClick={() => setShowLicenseInput(true)}
                  className="cursor-pointer text-xs font-bold text-primary underline-offset-2 transition ease-smooth hover:underline"
                >
                  Đã ủng hộ? Nhập mã tại đây
                </button>
              </div>
            )}
          </div>
        ) : null}
      </form>

      <SavedLessons
        items={savedIndex}
        onSelect={handleSelectSaved}
        onDelete={handleDeleteSaved}
      />

      {blockedByLimit ? (
        <div className="rounded-2xl border-2 border-border bg-highlight px-6 py-6 text-center">
          <p className="text-base font-bold leading-7 text-heading">
            Fluent hoàn toàn miễn phí! Nếu bạn thấy hữu ích và muốn ủng hộ mình,
            bạn có thể mua cho mình một ly cà phê để mình tiếp tục phát triển
            Fluent ☕
          </p>
          <Link
            href={CHECKOUT_URL}
            className="btn-3d mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
          >
            Nâng cấp Pro ☕
          </Link>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border-2 border-wrong bg-wrong-light px-5 py-4 text-sm font-bold text-wrong"
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-highlight px-6 py-20 text-center">
          <p className="text-4xl">
            <span className="animate-hourglass">⏳</span>
          </p>
          <p className="mt-4 text-lg font-extrabold text-heading">
            Đang tạo bài học...
          </p>
          <p className="mt-2 text-sm text-body">
            Thường mất khoảng 20–40 giây.
          </p>
        </div>
      ) : null}

      {result ? (
        <div
          ref={resultRef}
          className="scroll-mt-4 rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8"
        >
          <LessonDisplay
            lesson={result.lesson}
            videoId={result.videoId}
            isPro={isPro}
          />
        </div>
      ) : null}
    </div>
  );
}
