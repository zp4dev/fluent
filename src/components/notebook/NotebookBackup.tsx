"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { CHECKOUT_URL } from "@/lib/checkout";
import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";
import { downloadJson } from "@/lib/lessonBackup";
import { readNotebooks, replaceNotebooks } from "@/lib/notebook";
import {
  buildNotebookBackup,
  mergeNotebooks,
  notebookBackupFileName,
  parseNotebookBackup,
  type NotebookBackupError,
} from "@/lib/notebookBackup";

/**
 * Export / import of notebooks — Pro, like the lesson backup.
 *
 * Same honest caveat as that one: the notebooks are in the visitor's own
 * localStorage, so this gate is a product boundary and not a security one.
 * `downloadJson` is reused from the lesson backup rather than copied — the
 * mechanics of handing a browser a file don't differ per feature.
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

interface NotebookBackupProps {
  isPro: boolean;
  hydrated: boolean;
}

type Status = { kind: "info" | "error"; text: string } | null;

export default function NotebookBackup({
  isPro,
  hydrated,
}: NotebookBackupProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const errorText = useCallback(
    (error: NotebookBackupError): string => {
      switch (error) {
        case "invalid-json":
          return t.notebookBackup.errorInvalidJson;
        case "not-a-backup":
          return t.notebookBackup.errorNotBackup;
        case "wrong-schema":
          return t.notebookBackup.errorWrongSchema;
        case "no-notebooks":
          return t.notebookBackup.errorEmpty;
      }
    },
    [t],
  );

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

    const notebooks = readNotebooks();

    if (notebooks.length === 0) {
      setStatus({ kind: "info", text: t.notebookBackup.statusEmpty });
      return;
    }

    downloadJson(
      JSON.stringify(buildNotebookBackup(notebooks), null, 2),
      notebookBackupFileName(),
    );

    setStatus({
      kind: "info",
      text: fmt(t.notebookBackup.statusExported, {
        notebooks: notebooks.length,
        words: notebooks.reduce(
          (total, notebook) => total + notebook.words.length,
          0,
        ),
      }),
    });
  }

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    // Cleared before reading so choosing the same file again still fires.
    event.target.value = "";

    if (!file) {
      return;
    }

    // Re-checked rather than trusted from the click: a file dialog can stay
    // open a long time.
    if (!isPro) {
      setShowUpsell(true);
      return;
    }

    let text: string;

    try {
      text = await file.text();
    } catch {
      setStatus({ kind: "error", text: t.notebookBackup.errorReadFailed });
      return;
    }

    const parsed = parseNotebookBackup(text);

    if (!parsed.ok) {
      setStatus({ kind: "error", text: errorText(parsed.error) });
      return;
    }

    const merged = mergeNotebooks(readNotebooks(), parsed.notebooks);
    replaceNotebooks(merged.notebooks);

    const parts = [
      fmt(t.notebookBackup.statusImported, {
        words: merged.addedWords,
        notebooks: merged.addedNotebooks,
      }),
    ];

    if (merged.skippedWords > 0) {
      parts.push(
        fmt(t.notebookBackup.statusSkipped, { count: merged.skippedWords }),
      );
    }
    if (parsed.dropped > 0) {
      parts.push(
        fmt(t.notebookBackup.statusDropped, { count: parsed.dropped }),
      );
    }

    setStatus({ kind: "info", text: parts.join(" ") });
  }

  const buttonClass =
    "inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-border bg-card px-4 py-2 text-sm font-bold text-primary shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="rounded-3xl border-2 border-border bg-card px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-body">
          {t.notebookBackup.title}
        </h2>
        <span className="rounded-full bg-[#F2555A] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
          {t.notebookBackup.proTag}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-muted">
        {t.notebookBackup.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={!hydrated}
          className={buttonClass}
        >
          <ExportIcon />
          {t.notebookBackup.exportCta}
        </button>

        <button
          type="button"
          onClick={() => {
            if (allowedToRun()) {
              fileInputRef.current?.click();
            }
          }}
          disabled={!hydrated}
          className={buttonClass}
        >
          <ImportIcon />
          {t.notebookBackup.importCta}
        </button>

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
          aria-labelledby="notebook-backup-upsell-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
          onClick={() => setShowUpsell(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-border bg-card p-8 text-center shadow-[0_20px_50px_rgba(202,40,81,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-4xl">🗂️</p>
            <h2
              id="notebook-backup-upsell-title"
              className="mt-4 text-2xl font-extrabold text-heading"
            >
              {t.notebookBackup.upsellTitle}
            </h2>
            <p className="mt-3 text-base leading-7 text-body">
              {t.notebookBackup.upsellBody}
            </p>
            <Link
              href={CHECKOUT_URL}
              className="btn-3d mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white hover:bg-primary-hover"
            >
              {t.notebookBackup.upsellCta}
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
