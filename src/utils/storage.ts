import type { Theme } from "../types";
import { safeGetJSON, safeGetString, safeRemove, safeSetJSON } from "./safeStorage";

export { safeGetJSON, safeSetJSON, safeRemove, safeGetString } from "./safeStorage";
export { recordApiError, getLastApiError } from "./safeStorage";

export function getSavedTheme(): Theme {
  const saved = safeGetString("bamsignal-theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

export function getDailyKey(): string {
  return new Date().toLocaleDateString("en-CA");
}

export function readJson<T>(key: string, fallback: T): T {
  return safeGetJSON(key, fallback);
}

export function writeJson(key: string, value: unknown): boolean {
  return safeSetJSON(key, value);
}

export function removeJson(key: string): void {
  safeRemove(key);
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
