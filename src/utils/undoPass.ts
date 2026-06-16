import { STORAGE_KEYS } from "../constants/limits";
import { readDailyCount, readJson, writeJson } from "./storage";

const UNDO_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const UNDO_LAST_KEY = "bamsignal-undo-pass-last";
const UNDO_STACK_KEY = "bamsignal-undo-pass-stack";

export type UndoPassEntry = {
  profileId: string;
  at: string;
};

export function pushPassedProfile(profileId: string): void {
  const passed = readJson<string[]>(STORAGE_KEYS.passed, []);
  if (!passed.includes(profileId)) {
    writeJson(STORAGE_KEYS.passed, [...passed, profileId]);
  }
  const stack = readJson<UndoPassEntry[]>(UNDO_STACK_KEY, []);
  writeJson(UNDO_STACK_KEY, [{ profileId, at: new Date().toISOString() }, ...stack].slice(0, 20));
}

export function canUndoPass(isPremium: boolean): boolean {
  if (isPremium) return readJson<UndoPassEntry[]>(UNDO_STACK_KEY, []).length > 0;
  const last = readJson<{ at: string } | null>(UNDO_LAST_KEY, null);
  if (!last?.at) return readJson<UndoPassEntry[]>(UNDO_STACK_KEY, []).length > 0;
  return Date.now() - new Date(last.at).getTime() >= UNDO_COOLDOWN_MS;
}

export function undoLastPass(isPremium: boolean): string | null {
  const stack = readJson<UndoPassEntry[]>(UNDO_STACK_KEY, []);
  const entry = stack[0];
  if (!entry) return null;

  if (!isPremium) {
    const last = readJson<{ at: string } | null>(UNDO_LAST_KEY, null);
    if (last?.at && Date.now() - new Date(last.at).getTime() < UNDO_COOLDOWN_MS) {
      return null;
    }
    writeJson(UNDO_LAST_KEY, { at: new Date().toISOString() });
  }

  const passed = readJson<string[]>(STORAGE_KEYS.passed, []);
  writeJson(
    STORAGE_KEYS.passed,
    passed.filter((id) => id !== entry.profileId)
  );
  writeJson(UNDO_STACK_KEY, stack.slice(1));
  return entry.profileId;
}
