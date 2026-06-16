import { stateForCity } from "./profileOptions";

export const HOME_DISTANCE_OPTIONS = [5, 10, 25, 50, 100] as const;

export const MIN_HOME_DISTANCE_KM = 5;
export const DEFAULT_HOME_DISTANCE_KM = 25;

export type HomeDistanceKm = (typeof HOME_DISTANCE_OPTIONS)[number];

function formatStateLabel(state: string): string {
  if (!state) return "";
  return state === "FCT" ? "Abuja" : state;
}

export function normalizeHomeDistanceKm(value?: number | null): number {
  if (value == null || !Number.isFinite(value)) return DEFAULT_HOME_DISTANCE_KM;
  return Math.round(Math.max(MIN_HOME_DISTANCE_KM, Math.min(100, value)));
}

export function resolveLocationState(city: string, state: string): string {
  return state || (city ? stateForCity(city) || "" : "");
}

/** City name only — state is chosen separately in filters. */
export function formatCityWithState(city: string, state: string): string {
  if (city.trim()) return city.trim();
  const resolvedState = formatStateLabel(resolveLocationState(city, state));
  return resolvedState || "Set location";
}

export function formatHomeLocationSummary(city: string, state: string, distanceKm: number): string {
  return `${formatCityWithState(city, state)} • ${distanceKm}km`;
}

export function firstNameFromDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0];
}
