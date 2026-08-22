"use client";

import { useEffect, useRef, useState } from "react";

import { LOCALES, LOCALE_INFO } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { locale, t, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape. Both listeners are only attached
  // while the menu is open, so the page carries no handlers at rest.
  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t.language.switcherAria}
        title={t.language.label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 border-border bg-card px-3.5 text-heading shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
      >
        <GlobeIcon />
        <span className="text-xs font-extrabold uppercase tracking-wide">
          {LOCALE_INFO[locale].short}
        </span>
      </button>

      {open ? (
        <ul
          role="menu"
          aria-label={t.language.menuAria}
          className="absolute right-0 top-13 min-w-[11rem] overflow-hidden rounded-2xl border-2 border-border bg-card py-1.5 shadow-[0_12px_30px_rgba(45,45,45,0.18)]"
        >
          {LOCALES.map((option) => {
            const isActive = option === locale;

            return (
              <li key={option}>
                <button
                  type="button"
                  role="menuitem"
                  aria-current={isActive}
                  onClick={() => {
                    setLocale(option);
                    setOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ease-smooth hover:bg-highlight ${
                    isActive
                      ? "font-extrabold text-primary"
                      : "font-bold text-body"
                  }`}
                >
                  {LOCALE_INFO[option].label}
                  {isActive ? <span aria-hidden="true">✓</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
