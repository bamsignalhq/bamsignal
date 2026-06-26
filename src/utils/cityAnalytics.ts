import { STORAGE_KEYS } from "../constants/limits";
import type { AnalyticsEvent } from "./analytics";
import { readJson } from "./storage";

type EventRow = { event: AnalyticsEvent; at: string; meta?: Record<string, string> };

function allEvents(): EventRow[] {
  return readJson<EventRow[]>(STORAGE_KEYS.analytics, []);
}

export function getAnalyticsCity(): string {
  const profile = readJson<{ city?: string }>(STORAGE_KEYS.datingProfile, {});
  return profile.city?.trim() || "Unknown";
}

export function countByCity(event: AnalyticsEvent, withinMs?: number): Record<string, number> {
  const since = withinMs != null ? Date.now() - withinMs : 0;
  const counts: Record<string, number> = {};

  for (const row of allEvents()) {
    if (row.event !== event) continue;
    if (withinMs != null && new Date(row.at).getTime() < since) continue;
    const city = row.meta?.city || "Unknown";
    counts[city] = (counts[city] ?? 0) + 1;
  }

  return counts;
}

export function topCityFromCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).filter(([c]) => c !== "Unknown");
  if (!entries.length) return "—";
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function topCityByEvent(event: AnalyticsEvent, withinMs?: number): string {
  return topCityFromCounts(countByCity(event, withinMs));
}

export function mostActiveCityToday(): string {
  return topCityByEvent("daily_active", 24 * 60 * 60 * 1000);
}

export function fastestGrowingCity(): string {
  return topCityByEvent("signup_completed", 7 * 24 * 60 * 60 * 1000);
}

export function usersByCity(): Record<string, number> {
  return countByCity("signup_completed");
}

export function signalsByCity(withinMs?: number): Record<string, number> {
  return countByCity("signal_sent", withinMs);
}

export function premiumByCity(withinMs?: number): Record<string, number> {
  return countByCity("payment_successful", withinMs);
}

export function dauByCity(): Record<string, number> {
  return countByCity("daily_active", 24 * 60 * 60 * 1000);
}

export function profileCompletionByCity(): Record<string, number> {
  return countByCity("profile_completed");
}

export function cityLeaderboard(
  counts: Record<string, number>
): { city: string; value: number }[] {
  return Object.entries(counts)
    .filter(([city]) => city !== "Unknown")
    .map(([city, value]) => ({ city, value }))
    .sort((a, b) => b.value - a.value);
}

/** Demo revenue proxy from premium conversions per city */
export function premiumRevenueByCity(withinMs?: number): Record<string, number> {
  const counts = premiumByCity(withinMs);
  const revenue: Record<string, number> = {};
  for (const [city, n] of Object.entries(counts)) {
    revenue[city] = n * 3500;
  }
  return revenue;
}
