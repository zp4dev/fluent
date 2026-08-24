"use client";

import Link from "next/link";
import { useState } from "react";

import { LOCALES, LOCALE_INFO, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";

/** Mirrors the /api/admin/debug response. Loose on purpose: the whole point is
 *  to show whatever actually came back, including shapes we did not expect. */
interface DebugResult {
  videoId: string;
  supadata: Record<string, unknown>;
  transcript: {
    source: "supadata" | "fallback" | "none";
    chars: number;
    preview?: string;
    error?: string;
  };
  ai: Record<string, unknown>;
}

const str = (v: unknown) => (typeof v === "string" ? v : undefined);

/** Monospace block that scrolls on both axes instead of stretching the page. */
function Pre({ children }: { children: string }) {
  return (
    <pre className="mt-2 max-h-96 overflow-auto rounded-xl border-2 border-border bg-background p-4 text-xs leading-5 text-heading">
      {children}
    </pre>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-2 text-sm">
      <span className="font-extrabold uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="break-all font-bold text-heading">{value}</span>
    </div>
  );
}

export default function DebugConsole() {
  const { t, locale } = useI18n();

  const [url, setUrl] = useState("");
  const [lessonLocale, setLessonLocale] = useState<Locale>(locale);
  const [skipAi, setSkipAi] = useState(false);
  const [includeDepth, setIncludeDepth] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebugResult | null>(null);

  async function run(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          locale: lessonLocale,
          skipAi,
          includeDepth,
        }),
      });

      const data = (await response.json()) as DebugResult & { error?: string };

      if (!response.ok) {
        setError(data.error ?? t.adminDev.runFailed);
        return;
      }

      setResult(data);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : t.adminDev.runFailed);
    } finally {
      setRunning(false);
    }
  }

  const supadata = result?.supadata;
  const ai = result?.ai;

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6 px-5 py-12 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-heading">
            {t.adminDev.title}
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-body">
            {t.adminDev.subtitle}
          </p>
        </div>
        <Link
          href="/admin"
          className="cursor-pointer rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
        >
          {t.admin.title}
        </Link>
      </header>

      <form
        onSubmit={run}
        className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <label
          htmlFor="debug-url"
          className="block text-sm font-extrabold uppercase tracking-wide text-body"
        >
          {t.adminDev.urlLabel}
        </label>
        <input
          id="debug-url"
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder={t.generator.urlPlaceholder}
          className="mt-3 w-full rounded-2xl border-2 border-border bg-background px-4 py-3.5 text-base font-semibold text-heading outline-none transition ease-smooth placeholder:text-muted focus:border-primary"
        />

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-body">
            <input
              type="checkbox"
              checked={skipAi}
              onChange={(event) => setSkipAi(event.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
            />
            {t.adminDev.skipAi}
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-body">
            <input
              type="checkbox"
              checked={includeDepth}
              onChange={(event) => setIncludeDepth(event.target.checked)}
              className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
            />
            {t.adminDev.includeDepth}
          </label>

          <label className="flex items-center gap-2 text-sm font-bold text-body">
            {t.adminDev.localeLabel}
            <select
              value={lessonLocale}
              onChange={(event) => setLessonLocale(event.target.value as Locale)}
              className="cursor-pointer rounded-xl border-2 border-border bg-background px-3 py-1.5 text-sm font-bold text-heading outline-none focus:border-primary"
            >
              {LOCALES.map((option) => (
                <option key={option} value={option}>
                  {LOCALE_INFO[option].label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <p className="mt-4 text-xs font-bold leading-5 text-muted">
          ⚠️ {t.adminDev.costWarning}
        </p>

        <button
          type="submit"
          disabled={running || !url.trim()}
          className="btn-3d mt-5 cursor-pointer rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? t.adminDev.running : t.adminDev.run}
        </button>
      </form>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border-2 border-wrong bg-wrong-light px-5 py-4 text-sm font-bold text-wrong"
        >
          {error}
        </p>
      ) : null}

      {result ? (
        <>
          <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-heading">
              {t.adminDev.stageSupadata}
            </h2>
            <div className="mt-3 space-y-1">
              <Field label={t.adminDev.videoId} value={result.videoId} />

              {supadata?.configured === false ? (
                <p className="text-sm font-bold text-wrong">
                  {t.adminDev.notConfigured} {str(supadata.reason)}
                </p>
              ) : null}

              {supadata?.failed ? (
                <p className="text-sm font-bold text-wrong">
                  {t.adminDev.requestFailed} {str(supadata.error)}
                </p>
              ) : null}

              {typeof supadata?.status === "number" ? (
                <>
                  <Field
                    label={t.adminDev.endpoint}
                    value={str(supadata.url) ?? "—"}
                  />
                  <Field
                    label={t.adminDev.status}
                    value={String(supadata.status)}
                  />
                </>
              ) : null}
            </div>

            {str(supadata?.body) !== undefined ? (
              <>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-muted">
                  {t.adminDev.rawBody}
                </p>
                <Pre>{str(supadata?.body) ?? ""}</Pre>
              </>
            ) : null}
          </section>

          <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-heading">
              {t.adminDev.stageTranscript}
            </h2>
            <div className="mt-3 space-y-1">
              <Field
                label={t.adminDev.transcriptSource}
                value={
                  result.transcript.source === "supadata"
                    ? t.adminDev.sourceSupadata
                    : result.transcript.source === "fallback"
                      ? t.adminDev.sourceFallback
                      : t.adminDev.sourceNone
                }
              />
              <Field
                label={t.adminDev.transcriptChars}
                value={String(result.transcript.chars)}
              />
            </div>
            {result.transcript.error ? (
              <p className="mt-3 text-sm font-bold text-wrong">
                {t.adminDev.requestFailed} {result.transcript.error}
              </p>
            ) : null}
            {result.transcript.preview ? (
              <Pre>{result.transcript.preview}</Pre>
            ) : null}
          </section>

          <section className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-extrabold text-heading">
              {t.adminDev.stageAi}
            </h2>

            {ai?.skipped ? (
              <p className="mt-3 text-sm font-bold text-muted">
                {t.adminDev.skipped} {str(ai.reason)}
              </p>
            ) : (
              <>
                <div className="mt-3 space-y-1">
                  <Field
                    label={t.adminDev.provider}
                    value={
                      str(ai?.providerLabel) ?? str(ai?.provider) ?? "—"
                    }
                  />
                  <Field
                    label={t.adminDev.endpoint}
                    value={str(ai?.baseUrl) ?? "—"}
                  />
                  <Field label={t.adminDev.model} value={str(ai?.model) ?? "—"} />
                  {ai?.stopReason !== undefined ? (
                    <Field
                      label={t.adminDev.stopReason}
                      value={String(ai.stopReason)}
                    />
                  ) : null}
                  {typeof ai?.errorStatus === "number" ? (
                    <Field
                      label={t.adminDev.status}
                      value={String(ai.errorStatus)}
                    />
                  ) : null}
                </div>

                {ai?.ok === false ? (
                  <p className="mt-3 rounded-xl border-2 border-wrong bg-wrong-light px-4 py-3 text-sm font-bold text-wrong">
                    {t.adminDev.requestFailed} {str(ai.error)}
                  </p>
                ) : null}

                {ai?.usage ? (
                  <>
                    <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-muted">
                      {t.adminDev.usage}
                    </p>
                    <Pre>{JSON.stringify(ai.usage, null, 2)}</Pre>
                  </>
                ) : null}

                {ai?.parsedOk === true ? (
                  <p className="mt-4 text-sm font-bold text-translation">
                    {t.adminDev.parseOk}
                  </p>
                ) : null}
                {ai?.parsedOk === false ? (
                  <p className="mt-4 text-sm font-bold text-wrong">
                    {t.adminDev.parseFailed} {str(ai.parseError)}
                  </p>
                ) : null}

                {str(ai?.text) !== undefined ? (
                  <>
                    <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-muted">
                      {t.adminDev.rawOutput}
                    </p>
                    <Pre>{str(ai?.text) ?? ""}</Pre>
                  </>
                ) : null}

                {str(ai?.systemPrompt) ? (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-extrabold uppercase tracking-wide text-muted">
                      {t.adminDev.systemPrompt}
                    </summary>
                    <Pre>{str(ai?.systemPrompt) ?? ""}</Pre>
                  </details>
                ) : null}
              </>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
