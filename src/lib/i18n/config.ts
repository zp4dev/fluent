/**
 * Locale configuration.
 *
 * The chosen locale lives in a plain (non-httpOnly) cookie so that BOTH sides
 * can read it: the server renders the first paint in the right language — no
 * flash of Vietnamese — and the switcher can write it without a round trip.
 * It carries no privileges, so nothing is lost by letting the client see it.
 */

export const LOCALES = ["vi", "en", "es", "zh"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "vi";

export const LOCALE_COOKIE = "fluent_locale";

/** One year, so a returning visitor keeps their language. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export interface LocaleInfo {
  /** Endonym — a language is always listed in its own language. */
  label: string;
  /** Short code shown in the collapsed switcher button. */
  short: string;
  /** Goes on <html lang> and into Intl formatters. */
  htmlLang: string;
  /** How Claude should be told to write the lesson's native-language text. */
  promptName: string;
}

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  vi: {
    label: "Tiếng Việt",
    short: "VI",
    htmlLang: "vi",
    promptName: "Vietnamese",
  },
  en: {
    label: "English",
    short: "EN",
    htmlLang: "en",
    promptName: "English",
  },
  es: {
    label: "Español",
    short: "ES",
    htmlLang: "es",
    promptName: "Spanish",
  },
  zh: {
    label: "中文",
    short: "中",
    htmlLang: "zh-Hans",
    promptName: "Simplified Chinese",
  },
};

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

/** Narrows anything (a cookie value, a request body field) to a real locale. */
export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
