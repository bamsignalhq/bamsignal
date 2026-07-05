import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";
import { trackEvent } from "./analytics";

function readIdList(key: string): string[] {
  return readJson<string[]>(key, []);
}

function writeIdList(key: string, ids: string[]): void {
  writeJson(key, ids);
}

function addId(key: string, profileId: string, event: "safety_mute" | "safety_hide" | "safety_restrict"): void {
  const list = readIdList(key);
  if (!list.includes(profileId)) {
    writeIdList(key, [...list, profileId]);
    trackEvent(event, { profileId });
  }
}

function removeId(key: string, profileId: string): void {
  writeIdList(
    key,
    readIdList(key).filter((id) => id !== profileId),
  );
}

export function isUserMuted(profileId: string): boolean {
  return readIdList(STORAGE_KEYS.mutedProfiles).includes(profileId);
}

export function isUserHidden(profileId: string): boolean {
  return readIdList(STORAGE_KEYS.hiddenProfiles).includes(profileId);
}

export function isUserRestricted(profileId: string): boolean {
  return readIdList(STORAGE_KEYS.restrictedProfiles).includes(profileId);
}

export function muteUser(profileId: string): void {
  addId(STORAGE_KEYS.mutedProfiles, profileId, "safety_mute");
}

export function hideUser(profileId: string): void {
  addId(STORAGE_KEYS.hiddenProfiles, profileId, "safety_hide");
}

export function restrictUser(profileId: string): void {
  addId(STORAGE_KEYS.restrictedProfiles, profileId, "safety_restrict");
}

export function unmuteUser(profileId: string): void {
  removeId(STORAGE_KEYS.mutedProfiles, profileId);
}

export function unhideUser(profileId: string): void {
  removeId(STORAGE_KEYS.hiddenProfiles, profileId);
}

export function unrestrictUser(profileId: string): void {
  removeId(STORAGE_KEYS.restrictedProfiles, profileId);
}

export function listMutedUsers(): string[] {
  return readIdList(STORAGE_KEYS.mutedProfiles);
}

export function listHiddenUsers(): string[] {
  return readIdList(STORAGE_KEYS.hiddenProfiles);
}

export function listRestrictedUsers(): string[] {
  return readIdList(STORAGE_KEYS.restrictedProfiles);
}

export function unblockUser(profileId: string): void {
  const blocked = readIdList(STORAGE_KEYS.blocked).filter((id) => id !== profileId);
  writeJson(STORAGE_KEYS.blocked, blocked);
}

export function listBlockedUsers(): string[] {
  return readIdList(STORAGE_KEYS.blocked);
}

export function filterHiddenProfiles<T extends { id: string }>(profiles: T[]): T[] {
  const hidden = new Set(listHiddenUsers());
  return profiles.filter((p) => !hidden.has(p.id));
}
