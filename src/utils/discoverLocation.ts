import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export const FREE_DISCOVER_STATE_CHANGES = 2;
/** ~100 km — matches home feed max distance per city */
export const MAX_DISCOVER_RADIUS_MILES = 62;
export const KM_PER_MILE = 1.60934;

export type DiscoverLocationMeta = {
  stateChangeCount: number;
};

export function readDiscoverLocationMeta(): DiscoverLocationMeta {
  return readJson<DiscoverLocationMeta>(STORAGE_KEYS.discoverLocationMeta, { stateChangeCount: 0 });
}

export function milesToKm(miles: number): number {
  return Math.round(miles * KM_PER_MILE);
}

export function kmToMiles(km: number): number {
  return Math.round(km / KM_PER_MILE);
}

/** City-only changes are always free; state changes consume free allowance then require Premium. */
export function evaluateDiscoverStateChange(
  previousState: string,
  nextState: string,
  isPremium: boolean
): { allowed: boolean; requiresPayment: boolean } {
  if (previousState === nextState) {
    return { allowed: true, requiresPayment: false };
  }
  if (isPremium) {
    return { allowed: true, requiresPayment: false };
  }
  const meta = readDiscoverLocationMeta();
  if (meta.stateChangeCount < FREE_DISCOVER_STATE_CHANGES) {
    return { allowed: true, requiresPayment: false };
  }
  return { allowed: false, requiresPayment: true };
}

export function recordDiscoverStateChange(): void {
  const meta = readDiscoverLocationMeta();
  writeJson(STORAGE_KEYS.discoverLocationMeta, {
    stateChangeCount: meta.stateChangeCount + 1
  });
}

export function remainingFreeStateChanges(isPremium: boolean): number {
  if (isPremium) return Infinity;
  return Math.max(0, FREE_DISCOVER_STATE_CHANGES - readDiscoverLocationMeta().stateChangeCount);
}
