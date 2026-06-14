import type { Theme } from "../types";

export function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem("bamsignal-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "dark";
}

export function getDailyKey(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function readDailyCount(key: string): number {
  const stored = readJson<{ date: string; count: number }>(key, { date: "", count: 0 });
  if (stored.date !== getDailyKey()) return 0;
  return stored.count;
}

export function incrementDailyCount(key: string): number {
  const today = getDailyKey();
  const stored = readJson<{ date: string; count: number }>(key, { date: today, count: 0 });
  const count = stored.date === today ? stored.count + 1 : 1;
  writeJson(key, { date: today, count });
  return count;
}

export function getRemainingDaily(key: string, limit: number): number {
  return Math.max(0, limit - readDailyCount(key));
}
