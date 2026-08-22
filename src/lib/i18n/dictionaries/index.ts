import type { Locale } from "../config";
import en from "./en";
import es from "./es";
import type { Dictionary } from "./types";
import vi from "./vi";
import zh from "./zh";

/**
 * Every dictionary is imported eagerly rather than lazily per locale. They are
 * a few KB of plain strings each, and having all four in the client bundle is
 * what lets the switcher repaint the UI on the same tick instead of waiting
 * for a server round trip.
 */
export const DICTIONARIES: Record<Locale, Dictionary> = { vi, en, es, zh };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
