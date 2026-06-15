import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

const QUICKIE_PRICE_NAIRA = 999;
const PASS_MS = 24 * 60 * 60 * 1000;

export function quickiePriceLabel(): string {
  return `₦${QUICKIE_PRICE_NAIRA}`;
}

export function getQuickiePassUntil(): string | null {
  return readJson<string | null>(STORAGE_KEYS.quickiePassUntil, null);
}

export function isQuickiePassActive(): boolean {
  const until = getQuickiePassUntil();
  if (!until) return false;
  return new Date(until).getTime() > Date.now();
}

export function activateQuickiePass(): void {
  writeJson(STORAGE_KEYS.quickiePassUntil, new Date(Date.now() + PASS_MS).toISOString());
}

export function getUnlockedQuickieMatches(): string[] {
  return readJson<string[]>(STORAGE_KEYS.quickieUnlockedMatches, []);
}

export function unlockQuickieMatch(profileId: string): void {
  const list = getUnlockedQuickieMatches();
  if (!list.includes(profileId)) {
    writeJson(STORAGE_KEYS.quickieUnlockedMatches, [...list, profileId]);
  }
}

export function canMessageQuickieProfile(profileId: string, hasQuickieIntent: boolean): boolean {
  if (!hasQuickieIntent) return true;
  if (isQuickiePassActive()) return true;
  return getUnlockedQuickieMatches().includes(profileId);
}

export function profileHasQuickieIntent(intents: string[] = []): boolean {
  return intents.includes("Quickie");
}

export { QUICKIE_PRICE_NAIRA };
