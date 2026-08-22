"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { CHECKOUT_URL } from "@/lib/checkout";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";
import {
  backupFileName,
  buildBackupFile,
  downloadJson,
  parseBackupFile,
  type BackupParseError,
} from "@/lib/lessonBackup";
import {
  getAllSavedLessons,
  importSavedLessons,
  type SavedLessonMeta,
} from "@/lib/savedLessons";

/**
 * Export / import of saved lessons — a Pro feature.
 *
 * ON THE PRO GATE: everything this panel touches is the visitor's own
 * localStorage, so the check here is a product boundary, not a security one.
 * There is no server resource to protect and no server call to make — anyone
 * determined can copy their own storage out of devtools whatever this button
 * says. `isPro` comes from `useProStatus`, whose email half IS server-decided
 * (the session cookie is verified before /api/auth/session answers), which is
 * the same gate the rest of the Pro UI uses.
 */

function ExportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v11m0 0l-4-4m4 4l4-4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ImportIcon() {
  // The export arrow flipped: out of the tray, up into the app.
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 14V3m0 0L8 7m4-4l4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LessonBackupProps {
  isPro: boolean;
  /** False until the Pro check has landed — see the click handlers. */
  hydrated: boolean;
  /** Refreshed saved-lessons index for the current language, after an import. */
  onImported: (index: SavedLessonMeta[]) => void;
}

type Status = { kind: "info" | "error"; text: string } | null;

export default function LessonBackup({
  isPro,
  hydrated,
  onImported,
}: LessonBackupProps) {
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<Status>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errorText = useCallback(
    (error: BackupParseError): string => {
      switch (error) {
        case "invalid-json":
          return t.backup.errorInvalidJson;
        case "not-a-backup":
          return t.backup.errorNotBackup;
        case "wrong-schema":
          return t.backup.errorWrongSchema;
        case "no-lessons":
          return t.backup.errorNoLessons;
      }
    },
    [t],
  );

  /**
   * The gate itself. Returns false — and shows the upsell — for anyone who
   * isn't Pro. Also refuses while the Pro check is still in flight, so a real
   * subscriber is never shown an upsell just because their session hadn't
   * loaded yet.
   */
  function allowedToRun(): boolean {
    if (!hydrated) {
      return false;
    }

    if (!isPro) {
      setStatus(null);
      setShowUpsell(true);
      return false;
    }

    return true;
  }

  function handleExport() {
    if (!allowedToRun()) {
      return;
    }

    const entries = getAllSavedLessons();

    if (entries.length === 0) {
      setStatus({ kind: "info", text: t.backup.statusEmpty });
      return;
    }

    // Pretty-printed: the file is something people open, inspect and email to
    // themselves, not just a blob the app reads back.
    downloadJson(
      JSON.stringify(buildBackupFile(entries), null, 2),
      backupFileName(),
    );

    setStatus({
      kind: "info",
      text: fmt(t.backup.statusExported, { count: entries.length }),
    });
  }

  function handleImportClick() {
    if (!allowedToRun()) {
      return;
    }

    fileInputRef.current?.click();
  }

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Clearing the value here (not after reading) means picking the SAME file
    // again still fires a change event — the obvious thing to do after a failed
    // import is to fix the file and choose it again.
    event.target.value = "";

    if (!file) {
      return;
    }

    // Re-checked rather than trusted from the click: the file dialog can sit
    // open for a long time, and Pro can have lapsed while it was.
    if (!isPro) {
      setShowUpsell(true);
      return;
    }

    let text: string;

    try {
      text = await file.text();
    } catch {
      setStatus({ kind: "error", text: t.backup.errorReadFailed });
      return;
    }

    const parsed = parseBackupFile(text);

    if (!parsed.ok) {
      setStatus({ kind: "error", text: errorText(parsed.error) });
      return;
    }

    const result = importSavedLessons(parsed.entries, locale);
    onImported(result.index);

    // One sentence per thing that actually happened; silence about the rest.
    const parts = [fmt(t.backup.statusImported, { count: result.imported })];

    if (result.skipped > 0) {
      parts.push(fmt(t.backup.statusSkipped, { count: result.skipped }));
    }
    if (parsed.dropped > 0) {
      parts.push(fmt(t.backup.statusDropped, { count: parsed.dropped }));
    }
    if (result.failed > 0) {
      parts.push(fmt(t.backup.statusFailed, { count: result.failed }));
    }

    setStatus({
      kind: result.failed > 0 ? "error" : "info",
      text: parts.join(" "),
    });
  }

  const buttonClass =
    "inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="rounded-3xl border-2 border-border bg-card px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-body">
          {t.backup.title}
        </h2>
        <span className="rounded-full bg-[#F2555A] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
          {t.backup.proTag}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-muted">
        {t.backup.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={!hydrated}
          className={buttonClass}
        >
          <ExportIcon />
          {t.backup.exportCta}
        </button>

        <button
          type="button"
          onClick={handleImportClick}
          disabled={!hydrated}
          className={buttonClass}
        >
          <ImportIcon />
          {t.backup.importCta}
        </button>

        {/* Rendered for everyone but only ever opened from the Pro path above. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          className="hidden"
        />
      </div>

      {status ? (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`mt-3 text-sm font-bold leading-6 ${
            status.kind === "error" ? "text-wrong" : "text-body"
          }`}
        >
          {status.text}
        </p>
      ) : null}

      {showUpsell ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="backup-upsell-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setShowUpsell(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl">🗂️</p>
            <h2
              id="backup-upsell-title"
              className="mt-4 text-2xl font-extrabold text-heading"
            >
              {t.backup.upsellTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              {t.backup.upsellBody}
            </p>
            <Link
              href={CHECKOUT_URL}
              className="btn-3d mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              {t.backup.upsellCta}
            </Link>
            <button
              type="button"
              onClick={() => setShowUpsell(false)}
              className="mt-4 block w-full cursor-pointer text-sm font-bold text-muted transition ease-smooth hover:text-body"
            >
              {t.common.later}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
