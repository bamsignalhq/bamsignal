import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export function markFirstDiscoverIntroPending(): void {
  writeJson(STORAGE_KEYS.firstDiscoverIntroPending, true);
}

export function isFirstDiscoverIntroPending(): boolean {
  return Boolean(readJson(STORAGE_KEYS.firstDiscoverIntroPending, false));
}

export function completeFirstDiscoverIntro(): void {
  writeJson(STORAGE_KEYS.firstDiscoverIntroPending, false);
  writeJson(STORAGE_KEYS.discoveryTutorialDismissed, true);
}

export function isFirstDiscoverTipVisible(): boolean {
  if (isFirstDiscoverIntroPending()) return false;
  return !readJson(STORAGE_KEYS.firstDiscoverTipDismissed, false);
}

export function dismissFirstDiscoverTip(): void {
  writeJson(STORAGE_KEYS.firstDiscoverTipDismissed, true);
}

export function shouldCelebrateFirstSignal(): boolean {
  const journey = readJson<{ firstSignalSent?: boolean }>(STORAGE_KEYS.firstDayJourney, {});
  if (journey.firstSignalSent) return false;
  return !readJson(STORAGE_KEYS.firstSignalCelebrationSeen, false);
}

export function markFirstSignalCelebrationSeen(): void {
  writeJson(STORAGE_KEYS.firstSignalCelebrationSeen, true);
}
