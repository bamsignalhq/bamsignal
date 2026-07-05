import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type ImpressionMap = Record<string, { count: number; lastAt: string }>;

export function getDiscoveryImpressions(): ImpressionMap {
  return readJson<ImpressionMap>(STORAGE_KEYS.discoveryImpressions, {});
}

export function recordDiscoveryImpression(profileId: string): void {
  const map = getDiscoveryImpressions();
  const prev = map[profileId];
  map[profileId] = {
    count: (prev?.count ?? 0) + 1,
    lastAt: new Date().toISOString()
  };
  writeJson(STORAGE_KEYS.discoveryImpressions, map);
}

/** Penalize repeated profiles in the feed within 48h — reduces swipe churn */
export function impressionPenalty(profileId: string): number {
  const entry = getDiscoveryImpressions()[profileId];
  if (!entry) return 0;
  const hoursSince = (Date.now() - new Date(entry.lastAt).getTime()) / 3600000;
  if (hoursSince > 48) return 0;
  return Math.min(entry.count * 15, 60);
}

export function wasRecentlyShown(profileId: string, withinHours = 24): boolean {
  const entry = getDiscoveryImpressions()[profileId];
  if (!entry) return false;
  const hoursSince = (Date.now() - new Date(entry.lastAt).getTime()) / 3600000;
  return hoursSince <= withinHours && entry.count >= 2;
}
