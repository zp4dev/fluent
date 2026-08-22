/**
 * Theme configuration.
 *
 * The chosen theme lives in a plain (non-httpOnly) cookie, mirroring the locale
 * cookie in `@/lib/i18n/config`, so BOTH sides can read it: the server stamps
 * `data-theme` on <html> for the very first paint, and the toggle can write it
 * without a round trip. It carries no privileges, so nothing is lost by letting
 * the client see it.
 *
 * This replaces the old localStorage-only preference, which the server could
 * never see — hence the pre-paint script AND a hydration mismatch on the
 * toggle's own icon. With a cookie, a returning visitor needs neither.
 */

export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

/** Used only when nothing is known yet; the script below corrects it. */
export const DEFAULT_THEME: Theme = "light";

export const THEME_COOKIE = "fluent_theme";

/** One year, so a returning visitor keeps their theme. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Where the preference used to live. The bootstrap script below migrates it
 * into the cookie once, so anyone who picked a theme before this change keeps
 * it instead of being silently reset to their OS preference.
 */
export const LEGACY_THEME_STORAGE_KEY = "fluent.theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** Client-side cookie write — the toggle's only persistence step. */
export function persistTheme(theme: Theme): void {
  const secure = window.location.protocol === "https:" ? ";secure" : "";
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=${THEME_COOKIE_MAX_AGE};samesite=lax${secure}`;
}

/**
 * Runs before first paint, and ONLY when there is no theme cookie yet — a
 * first-ever visit, or one where the cookie was cleared. It resolves the theme
 * the server could not know (a migrated legacy preference, else the OS-level
 * setting), applies it, and writes the cookie so that from the next request on
 * the server renders the right theme and this script is no longer emitted.
 *
 * Built from the constants above rather than hand-written, so the cookie name,
 * lifetime and legacy key cannot drift out of sync with the rest of the module.
 */
export function themeBootstrapScript(): string {
  const cookie = JSON.stringify(THEME_COOKIE);
  const legacy = JSON.stringify(LEGACY_THEME_STORAGE_KEY);

  return `(function(){try{var C=${cookie},K=${legacy},t=null;try{t=localStorage.getItem(K)}catch(e){}if(t!=="dark"&&t!=="light"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t);document.cookie=C+"="+t+";path=/;max-age=${THEME_COOKIE_MAX_AGE};samesite=lax"+(location.protocol==="https:"?";secure":"");if(document.cookie.indexOf(C+"=")>-1){try{localStorage.removeItem(K)}catch(e){}}}catch(e){}})()`;
}
