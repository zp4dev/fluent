"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_INFO,
  type Locale,
} from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

interface I18nValue {
  locale: Locale;
  /** The active dictionary. Read it directly: `t.generator.submit`. */
  t: Dictionary;
  setLocale: (next: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

/** Written client-side so the switcher needs no server round trip. */
function persistLocale(locale: Locale): void {
  const secure = window.location.protocol === "https:" ? ";secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${LOCALE_COOKIE_MAX_AGE};samesite=lax${secure}`;
}

/**
 * `initialLocale` comes from the server, which read the same cookie — so the
 * first paint is already in the right language and there is no flash of
 * Vietnamese, and no hydration mismatch to suppress.
 */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) {
        return;
      }

      // Repaint immediately from the bundled dictionary...
      setLocaleState(next);
      persistLocale(next);
      document.documentElement.lang = LOCALE_INFO[next].htmlLang;

      // ...then let the server re-render the parts only it produces (the
      // document <title>). refresh() keeps client state, so an open lesson
      // stays on screen.
      router.refresh();
    },
    [locale, router],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, t: DICTIONARIES[locale], setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);

  if (!value) {
    throw new Error("useI18n must be used inside <I18nProvider>.");
  }

  return value;
}
