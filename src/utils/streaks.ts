import { STORAGE_KEYS } from "../constants/limits";
import { getDailyKey, readJson, writeJson } from "./storage";

export type StreakData = {
  count: number;
  longest: number;
  lastDate: string;
};

const defaultStreak = (): StreakData => ({ count: 0, longest: 0, lastDate: "" });

export function getStreak(): StreakData {
  return readJson(STORAGE_KEYS.streak, defaultStreak());
}

export function getStreakLabel(count: number): string {
  if (count >= 30) return "🔥 30 Day Streak";
  if (count >= 7) return "🔥 7 Day Streak";
  if (count >= 3) return "🔥 3 Day Streak";
  if (count >= 1) return `🔥 ${count} Day Streak`;
  return "Start your streak today";
}

/** Call on login, signal sent, or profile milestone */
export function recordStreakActivity(): StreakData {
  const today = getDailyKey();
  const current = getStreak();

  if (current.lastDate === today) return current;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toLocaleDateString("en-CA");

  let count = 1;
  if (current.lastDate === yesterdayKey) {
    count = current.count + 1;
  }

  const next: StreakData = {
    count,
    longest: Math.max(current.longest, count),
    lastDate: today
  };
  writeJson(STORAGE_KEYS.streak, next);
  return next;
}

export function getSignalsSentCount(): number {
  return readJson<number>(STORAGE_KEYS.signalsSent, 0);
}

export function incrementSignalsSent(): number {
  const next = getSignalsSentCount() + 1;
  writeJson(STORAGE_KEYS.signalsSent, next);
  recordStreakActivity();
  return next;
}

export function getSignalsReceivedCount(): number {
  return readJson<number>(STORAGE_KEYS.signalsReceived, 0);
}
