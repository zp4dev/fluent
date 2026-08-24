import { cookies } from "next/headers";

import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

/**
 * The locale for the current request, straight from the cookie.
 *
 * Reading a cookie opts the caller into dynamic rendering — which every route
 * here already is, since the session cookie is read on the same requests.
 * Anything unrecognised (a hand-edited cookie, a locale we dropped) falls back
 * to Vietnamese rather than 404ing.
 */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}

/** Dictionary for the current request — for metadata and API error copy. */
export async function getServerDictionary(): Promise<Dictionary> {
  return getDictionary(await getServerLocale());
}
