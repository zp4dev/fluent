"use client";

import { useCallback } from "react";

import {
  readLocalStorage,
  useHydrated,
  useLocalStorageValue,
  writeLocalStorage,
} from "@/lib/browserStore";

export const DAILY_LIMIT = 3;

const STORAGE_KEY = "fluent.dailyUsage";

interface DailyUsage {
  date: string;
  count: number;
}

function todayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Today's count. A missing, malformed, or previous-day entry all read as 0 —
 * the stale record is left alone and simply overwritten by the next
 * increment, so there's nothing to normalize on load.
 */
function countFor(raw: string | null): number {
  if (!raw) {
    return 0;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DailyUsage>;
    if (parsed.date === todayKey() && typeof parsed.count === "number") {
      return parsed.count;
    }
  } catch {
    // Malformed storage — start fresh.
  }

  return 0;
}

export function useDailyLimit() {
  const raw = useLocalStorageValue(STORAGE_KEY);
  const hydrated = useHydrated();

  const count = countFor(raw);

  const increment = useCallback(() => {
    const usage: DailyUsage = {
      date: todayKey(),
      count: countFor(readLocalStorage(STORAGE_KEY)) + 1,
    };
    writeLocalStorage(STORAGE_KEY, JSON.stringify(usage));
  }, []);

  const remaining = Math.max(0, DAILY_LIMIT - count);
  const limitReached = hydrated && remaining <= 0;

  return { count, remaining, limitReached, hydrated, increment };
}
