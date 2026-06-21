import { STORAGE_KEYS } from "../constants/limits";
import type { SavedProfileEntry } from "../constants/savedProfiles";
import { readJson, writeJson } from "./storage";

export function readSavedProfileEntries(): SavedProfileEntry[] {
  const legacyIds = readJson<string[]>(STORAGE_KEYS.savedDiscoverProfiles, []);
  const entries = readJson<SavedProfileEntry[]>(STORAGE_KEYS.savedProfiles, []);

  if (entries.length) return entries;

  if (legacyIds.length) {
    const migrated = legacyIds.map((profileId) => ({
      profileId,
      savedAt: new Date().toISOString()
    }));
    writeSavedProfileEntries(migrated);
    return migrated;
  }

  return [];
}

export function writeSavedProfileEntries(entries: SavedProfileEntry[]): void {
  writeJson(STORAGE_KEYS.savedProfiles, entries);
  writeJson(
    STORAGE_KEYS.savedDiscoverProfiles,
    entries.map((entry) => entry.profileId)
  );
}

export function readSavedProfileIds(): string[] {
  return readSavedProfileEntries().map((entry) => entry.profileId);
}

export function mergeSavedProfileIdsFromServer(
  serverEntries: SavedProfileEntry[],
  localEntries: SavedProfileEntry[] = readSavedProfileEntries()
): SavedProfileEntry[] {
  const byId = new Map<string, SavedProfileEntry>();

  for (const entry of localEntries) {
    byId.set(entry.profileId, entry);
  }
  for (const entry of serverEntries) {
    const existing = byId.get(entry.profileId);
    if (!existing || entry.savedAt > existing.savedAt) {
      byId.set(entry.profileId, entry);
    }
  }

  return [...byId.values()].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}
