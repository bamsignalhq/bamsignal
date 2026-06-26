import {
  FEATURE_FLAG_CACHE_TTL_MS,
  FEATURE_FLAG_DEFAULTS,
  FEATURE_FLAG_OFFLINE_CACHE_KEY,
  type EnterpriseFeatureFlagKey
} from "../constants/featureFlagPlatform";
import { FEATURE_FLAG_PLATFORM_SEED } from "../data/featureFlagPlatformSeed";
import type {
  EnterpriseFeatureFlagRecord,
  FeatureFlagEvaluationContext
} from "../types/featureFlagPlatform";
import { evaluateEnterpriseFeatureFlag, evaluateFeatureFlagByKey } from "../utils/featureFlagPlatformLogic";
import { apiUrl } from "./supabase";

type CachedFeatureFlags = {
  flags: EnterpriseFeatureFlagRecord[];
  cachedAt: string;
};

let memoryCache: CachedFeatureFlags | null = null;
let inflight: Promise<EnterpriseFeatureFlagRecord[]> | null = null;

function readOfflineCache(): CachedFeatureFlags | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FEATURE_FLAG_OFFLINE_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CachedFeatureFlags;
  } catch {
    return null;
  }
}

function writeOfflineCache(flags: EnterpriseFeatureFlagRecord[]) {
  if (typeof window === "undefined") return;
  const payload: CachedFeatureFlags = {
    flags,
    cachedAt: new Date().toISOString()
  };
  window.localStorage.setItem(FEATURE_FLAG_OFFLINE_CACHE_KEY, JSON.stringify(payload));
  memoryCache = payload;
}

function isCacheFresh(cachedAt: string) {
  return Date.now() - Date.parse(cachedAt) < FEATURE_FLAG_CACHE_TTL_MS;
}

function fallbackFlags(): EnterpriseFeatureFlagRecord[] {
  const offline = readOfflineCache();
  if (offline?.flags?.length) return offline.flags;
  if (memoryCache?.flags?.length) return memoryCache.flags;
  return FEATURE_FLAG_PLATFORM_SEED;
}

export async function loadFeatureFlags(force = false): Promise<EnterpriseFeatureFlagRecord[]> {
  const offline = readOfflineCache();
  if (!force && offline && isCacheFresh(offline.cachedAt)) {
    memoryCache = offline;
    return offline.flags;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const response = await fetch(apiUrl("/api/feature-flags"), { cache: "no-store" });
      if (!response.ok) throw new Error("feature_flags_fetch_failed");
      const payload = (await response.json()) as { flags: EnterpriseFeatureFlagRecord[] };
      const flags = payload.flags?.length ? payload.flags : fallbackFlags();
      writeOfflineCache(flags);
      return flags;
    } catch {
      return fallbackFlags();
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function getCachedFeatureFlags(): EnterpriseFeatureFlagRecord[] {
  return fallbackFlags();
}

export function isFeatureFlagEnabled(
  key: EnterpriseFeatureFlagKey,
  context: FeatureFlagEvaluationContext = {},
  flags = getCachedFeatureFlags()
): boolean {
  return evaluateFeatureFlagByKey(key, flags, context);
}

export function evaluateCachedFeatureFlag(
  flag: EnterpriseFeatureFlagRecord | undefined,
  context: FeatureFlagEvaluationContext = {}
): boolean {
  if (!flag) return false;
  return evaluateEnterpriseFeatureFlag(flag, context);
}

export function getFeatureFlagDefault(key: EnterpriseFeatureFlagKey): boolean {
  return FEATURE_FLAG_DEFAULTS[key] ?? false;
}

export function primeFeatureFlagCache(flags: EnterpriseFeatureFlagRecord[]) {
  writeOfflineCache(flags);
}
