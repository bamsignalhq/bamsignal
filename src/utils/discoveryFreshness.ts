import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type DiscoveryCooldownEntry = {
  passedAt?: string;
  signaledAt?: string;
  matchedAt?: string;
};

export type DiscoveryCooldownMap = Record<string, DiscoveryCooldownEntry>;

export const DEFAULT_PASS_REDISCOVERY_DAYS = 14;
export const DEFAULT_SEEN_SUPPRESS_HOURS = 24;

function nowIso(): string {
  return new Date().toISOString();
}

export function readDiscoveryCooldowns(): DiscoveryCooldownMap {
  return readJson<DiscoveryCooldownMap>(STORAGE_KEYS.discoveryCooldowns, {});
}

export function writeDiscoveryCooldowns(map: DiscoveryCooldownMap): void {
  writeJson(STORAGE_KEYS.discoveryCooldowns, map);
}

export function recordDiscoveryPass(profileId: string): void {
  if (!profileId) return;
  const map = readDiscoveryCooldowns();
  map[profileId] = { ...(map[profileId] ?? {}), passedAt: nowIso() };
  writeDiscoveryCooldowns(map);
}

export function clearDiscoveryPass(profileId: string): void {
  if (!profileId) return;
  const map = readDiscoveryCooldowns();
  if (!map[profileId]?.passedAt) return;
  map[profileId] = { ...(map[profileId] ?? {}) };
  delete map[profileId].passedAt;
  writeDiscoveryCooldowns(map);
}

export function recordDiscoverySignal(profileId: string): void {
  if (!profileId) return;
  const map = readDiscoveryCooldowns();
  map[profileId] = { ...(map[profileId] ?? {}), signaledAt: nowIso() };
  writeDiscoveryCooldowns(map);
}

export function recordDiscoveryMatch(profileId: string): void {
  if (!profileId) return;
  const map = readDiscoveryCooldowns();
  map[profileId] = { ...(map[profileId] ?? {}), matchedAt: nowIso() };
  writeDiscoveryCooldowns(map);
}

function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return (Date.now() - t) / 86400000;
}

export function isInPassCooldown(profileId: string, days = DEFAULT_PASS_REDISCOVERY_DAYS): boolean {
  const entry = readDiscoveryCooldowns()[profileId];
  const since = daysSince(entry?.passedAt);
  if (since == null) return false;
  return since < days;
}

