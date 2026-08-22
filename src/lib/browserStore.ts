"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * localStorage-backed values that are safe to render during hydration.
 *
 * Reading storage in a useEffect and calling setState works, but it re-renders
 * after paint and trips react-hooks/set-state-in-effect. useSyncExternalStore
 * is the supported way to read a browser-only source: it renders the server
 * snapshot during hydration — so the server markup still matches — then swaps
 * to the real value immediately afterwards, with no effect and no cascading
 * render.
 *
 * Values are cached per key because React calls getSnapshot on every render;
 * hitting localStorage each time would be wasteful, and returning a fresh
 * object would loop.
 */

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, string | null>();

/** Current value for a key, reading through the cache. Browser-only. */
export function readLocalStorage(key: string): string | null {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  let value: string | null = null;
  try {
    value = window.localStorage.getItem(key);
  } catch {
    // Storage may be unavailable (private mode, blocked cookies).
  }

  cache.set(key, value);
  return value;
}

/** Write a value, then wake every hook subscribed to that key. */
export function writeLocalStorage(key: string, value: string): void {
  cache.set(key, value);

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore write failures (private mode, quota) — the cache still keeps this
    // tab consistent for the rest of the session.
  }

  listeners.get(key)?.forEach((notify) => notify());
}

function subscribeTo(key: string) {
  return (onStoreChange: () => void) => {
    const existing = listeners.get(key);
    const forKey = existing ?? new Set<() => void>();
    if (!existing) {
      listeners.set(key, forKey);
    }
    forKey.add(onStoreChange);

    // Another tab wrote to storage — drop the cache so the next read is fresh.
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) {
        cache.delete(key);
        onStoreChange();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      forKey.delete(onStoreChange);
      window.removeEventListener("storage", onStorage);
    };
  };
}

const getNull = () => null;

/** The stored string — null on the server and through the hydration render. */
export function useLocalStorageValue(key: string): string | null {
  const subscribe = useMemo(() => subscribeTo(key), [key]);
  const getSnapshot = useCallback(() => readLocalStorage(key), [key]);

  return useSyncExternalStore(subscribe, getSnapshot, getNull);
}

const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False on the server and through the hydration render, true immediately
 * after — the signal components use to hold back browser-only UI until the
 * markup has matched.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(neverChanges, onClient, onServer);
}
