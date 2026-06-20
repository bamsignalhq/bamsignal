import { readJson, writeJson } from "./storage";

const CACHE_STORAGE_KEY = "bamsignal-open-app-onboarding-confirmed";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type OpenAppOnboardingCacheEntry = {
  userId: string;
  confirmedAt: string;
  expiresAt: number;
};

function readCacheRoot(): Record<string, OpenAppOnboardingCacheEntry> {
  return readJson<Record<string, OpenAppOnboardingCacheEntry>>(CACHE_STORAGE_KEY, {});
}

function writeCacheRoot(entries: Record<string, OpenAppOnboardingCacheEntry>): void {
  writeJson(CACHE_STORAGE_KEY, entries);
}

export function readOpenAppOnboardingCache(userId = ""): boolean {
  const id = String(userId || "").trim();
  if (!id || typeof window === "undefined") return false;

  const entry = readCacheRoot()[id];
  if (!entry) return false;
  if (entry.userId !== id) return false;
  if (!Number.isFinite(entry.expiresAt) || Date.now() > entry.expiresAt) {
    clearOpenAppOnboardingCache(id);
    return false;
  }
  return true;
}

export function writeOpenAppOnboardingCache(userId = ""): void {
  const id = String(userId || "").trim();
  if (!id || typeof window === "undefined") return;

  const confirmedAt = new Date().toISOString();
  const entries = readCacheRoot();
  entries[id] = {
    userId: id,
    confirmedAt,
    expiresAt: Date.now() + CACHE_TTL_MS
  };
  writeCacheRoot(entries);
}

export function clearOpenAppOnboardingCache(userId = ""): void {
  if (typeof window === "undefined") return;
  const id = String(userId || "").trim();
  const entries = readCacheRoot();
  if (!id) {
    writeCacheRoot({});
    return;
  }
  if (!entries[id]) return;
  delete entries[id];
  writeCacheRoot(entries);
}

export const OPEN_APP_ONBOARDING_CACHE_TTL_MS = CACHE_TTL_MS;
