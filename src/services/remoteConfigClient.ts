import {
  REMOTE_CONFIG_CACHE_TTL_MS,
  REMOTE_CONFIG_DEFAULTS,
  REMOTE_CONFIG_OFFLINE_CACHE_KEY
} from "../constants/configurationPlatform";
import { CONFIGURATION_ENTRY_SEED } from "../data/configurationPlatformSeed";
import type { ConfigurationEntryRecord, ConfigurationValue } from "../types/configurationPlatform";
import { buildRemoteConfigMap, resolveRemoteConfigValue } from "../utils/configurationPlatformLogic";
import { listConfigurationEntries } from "../utils/configurationPlatformStore";
import { apiUrl } from "./supabase";

type CachedRemoteConfig = {
  config: Record<string, ConfigurationValue>;
  cachedAt: string;
  revision?: number;
};

let memoryCache: CachedRemoteConfig | null = null;
let inflight: Promise<CachedRemoteConfig> | null = null;
const listeners = new Set<() => void>();

function readOfflineCache(): CachedRemoteConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REMOTE_CONFIG_OFFLINE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { entries?: ConfigurationEntryRecord[]; cachedAt?: string };
    if (parsed.entries?.length) {
      return {
        config: buildRemoteConfigMap(parsed.entries),
        cachedAt: parsed.cachedAt ?? new Date().toISOString()
      };
    }
    return JSON.parse(raw) as CachedRemoteConfig;
  } catch {
    return null;
  }
}

function writeOfflineCache(snapshot: CachedRemoteConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMOTE_CONFIG_OFFLINE_CACHE_KEY, JSON.stringify(snapshot));
  memoryCache = snapshot;
  for (const listener of listeners) listener();
}

function isCacheFresh(cachedAt: string) {
  return Date.now() - Date.parse(cachedAt) < REMOTE_CONFIG_CACHE_TTL_MS;
}

function fallbackSnapshot(): CachedRemoteConfig {
  const offline = readOfflineCache();
  if (offline) return offline;
  if (memoryCache) return memoryCache;
  return {
    config: { ...REMOTE_CONFIG_DEFAULTS, ...buildRemoteConfigMap(CONFIGURATION_ENTRY_SEED) },
    cachedAt: new Date().toISOString()
  };
}

export async function loadRemoteConfig(force = false): Promise<CachedRemoteConfig> {
  const offline = readOfflineCache();
  if (!force && offline && isCacheFresh(offline.cachedAt)) {
    memoryCache = offline;
    return offline;
  }

  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const response = await fetch(apiUrl("/api/remote-config"), { cache: "no-store" });
      if (!response.ok) throw new Error("remote_config_fetch_failed");
      const payload = (await response.json()) as CachedRemoteConfig & { config: Record<string, ConfigurationValue> };
      const snapshot: CachedRemoteConfig = {
        config: payload.config ?? {},
        cachedAt: new Date().toISOString(),
        revision: payload.revision
      };
      writeOfflineCache(snapshot);
      return snapshot;
    } catch {
      return fallbackSnapshot();
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function getCachedRemoteConfig(): CachedRemoteConfig {
  return fallbackSnapshot();
}

export function getRemoteConfigValue<T extends ConfigurationValue = ConfigurationValue>(
  key: string,
  fallback?: T
): T {
  const snapshot = getCachedRemoteConfig();
  const localEntries = listConfigurationEntries();
  const resolved = resolveRemoteConfigValue(key, localEntries, {
    ...REMOTE_CONFIG_DEFAULTS,
    ...snapshot.config
  });
  return (resolved ?? fallback ?? REMOTE_CONFIG_DEFAULTS[key] ?? null) as T;
}

export function subscribeRemoteConfig(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function primeRemoteConfigCache(snapshot: CachedRemoteConfig) {
  writeOfflineCache(snapshot);
}
