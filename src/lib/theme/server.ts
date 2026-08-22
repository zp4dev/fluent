import { cookies } from "next/headers";

import { THEME_COOKIE, isTheme, type Theme } from "./config";

/**
 * The theme for the current request, or null when the browser has not told us
 * yet. Null is meaningful and must not be collapsed into "light": it is the
 * one case where the pre-paint bootstrap script still has to run, because only
 * the browser knows the OS-level light/dark preference.
 */
export async function getServerTheme(): Promise<Theme | null> {
  const store = await cookies();
  const value = store.get(THEME_COOKIE)?.value;

  return isTheme(value) ? value : null;
}
