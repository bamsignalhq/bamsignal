import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export function isQuickieUnlocked(matchId: string): boolean {
  const unlocked = readJson<string[]>(STORAGE_KEYS.quickieUnlockedMatches, []);
  return unlocked.includes(matchId);
}

export function unlockQuickieChat(matchId: string): void {
  const unlocked = readJson<string[]>(STORAGE_KEYS.quickieUnlockedMatches, []);
  if (unlocked.includes(matchId)) return;
  writeJson(STORAGE_KEYS.quickieUnlockedMatches, [...unlocked, matchId]);
}
