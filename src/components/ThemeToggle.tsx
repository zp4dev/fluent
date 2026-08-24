"use client";

import { useCallback, useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n/context";
import { isTheme, persistTheme, type Theme } from "@/lib/theme/config";

export default function ThemeToggle({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const { t } = useI18n();
  // Seeded from the cookie the server read, NOT from localStorage — so the
  // first client render is identical to the server's and the icon no longer
  // causes a hydration mismatch.
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const isDark = theme === "dark";

  // First visit only. With no cookie, the server had to fall back to light
  // while the bootstrap script applied the OS preference to <html> before
  // paint; adopt whatever it actually set. On every later visit the cookie
  // exists, the server already agrees, and this is a no-op.
  useEffect(() => {
    const applied = document.documentElement.getAttribute("data-theme");

    if (isTheme(applied)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme((current) => (current === applied ? current : applied));
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      persistTheme(next);
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t.theme.toLight : t.theme.toDark}
      title={isDark ? t.theme.light : t.theme.dark}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-border bg-card text-heading shadow-sm transition ease-smooth hover:border-primary hover:bg-highlight"
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
