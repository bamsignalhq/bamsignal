import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "../utils/storage";
import { readOfflineCache, writeOfflineCache } from "./offlineCache";
import { isNativeApp } from "./platform";

/** Dual-write member snapshot to Capacitor Preferences after successful hydrate. */
export async function snapshotMemberDataToNativeCache(): Promise<void> {
  if (!isNativeApp()) return;

  const profile = readJson(STORAGE_KEYS.datingProfile, {});
  const messages = readJson(STORAGE_KEYS.chats, {});
  const matches = readJson(STORAGE_KEYS.matches, []);
  const settings = readJson(STORAGE_KEYS.userProfile, {});

  await Promise.all([
    writeOfflineCache("profile", profile),
    writeOfflineCache("messages", messages),
    writeOfflineCache("matches", matches),
    writeOfflineCache("settings", settings)
  ]);
}

/** Restore last native snapshot when local storage is empty (cold start offline). */
export async function restoreNativeMemberSnapshotIfNeeded(): Promise<boolean> {
  if (!isNativeApp()) return false;

  const hasProfile = Boolean(readJson(STORAGE_KEYS.datingProfile, null));
  const hasChats = Object.keys(readJson<Record<string, unknown>>(STORAGE_KEYS.chats, {})).length > 0;
  if (hasProfile || hasChats) return false;

  const [profile, messages, matches, settings] = await Promise.all([
    readOfflineCache<Record<string, unknown>>("profile"),
    readOfflineCache<Record<string, unknown>>("messages"),
    readOfflineCache<unknown[]>("matches"),
    readOfflineCache<Record<string, unknown>>("settings")
  ]);

  if (!profile && !messages && !matches) return false;

  if (profile) writeJson(STORAGE_KEYS.datingProfile, profile);
  if (messages) writeJson(STORAGE_KEYS.chats, messages);
  if (matches) writeJson(STORAGE_KEYS.matches, matches);
  if (settings) writeJson(STORAGE_KEYS.userProfile, settings);

  return true;
}
