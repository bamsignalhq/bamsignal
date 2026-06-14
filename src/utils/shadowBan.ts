import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

/** Profile IDs (discover) and member keys (`member:phone`) */
export function readShadowBannedIds(): string[] {
  return readJson<string[]>(STORAGE_KEYS.shadowBanned, []);
}

export function isShadowBanned(id: string): boolean {
  if (!id) return false;
  return readShadowBannedIds().includes(id);
}

export function shadowBanId(id: string): void {
  const ids = readShadowBannedIds();
  if (!ids.includes(id)) writeJson(STORAGE_KEYS.shadowBanned, [...ids, id]);
}

export function liftShadowBan(id: string): void {
  writeJson(
    STORAGE_KEYS.shadowBanned,
    readShadowBannedIds().filter((entry) => entry !== id)
  );
}

export function memberShadowKey(phone?: string, email?: string): string {
  const key = (phone || email || "").trim();
  return key ? `member:${key}` : "member:anonymous";
}

export function isViewerShadowBanned(phone?: string, email?: string): boolean {
  return isShadowBanned(memberShadowKey(phone, email));
}

/** Outbound signals/messages from this sender should not reach recipients. */
export function shouldSuppressOutbound(fromId: string): boolean {
  return isShadowBanned(fromId);
}
