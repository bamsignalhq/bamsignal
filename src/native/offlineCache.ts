import { Preferences } from "@capacitor/preferences";
import { isNativeApp } from "./platform";

const PREFIX = "bamsignal_offline_";

export type OfflineCacheKey =
  | "profile"
  | "messages"
  | "matches"
  | "settings"
  | "notification_history";

const KEYS: Record<OfflineCacheKey, string> = {
  profile: `${PREFIX}profile`,
  messages: `${PREFIX}messages`,
  matches: `${PREFIX}matches`,
  settings: `${PREFIX}settings`,
  notification_history: `${PREFIX}notification_history`
};

export async function writeOfflineCache<T>(key: OfflineCacheKey, value: T): Promise<void> {
  if (!isNativeApp()) return;
  await Preferences.set({
    key: KEYS[key],
    value: JSON.stringify({ at: Date.now(), data: value })
  });
}

export async function readOfflineCache<T>(key: OfflineCacheKey): Promise<T | null> {
  if (!isNativeApp()) return null;
  const { value } = await Preferences.get({ key: KEYS[key] });
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { data: T };
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export async function clearOfflineCache(key?: OfflineCacheKey): Promise<void> {
  if (!isNativeApp()) return;
  const targets = key ? [key] : (Object.keys(KEYS) as OfflineCacheKey[]);
  await Promise.all(targets.map((k) => Preferences.remove({ key: KEYS[k] })));
}
