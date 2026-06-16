import { stateForCity } from "./profileOptions";

export const HOME_DISTANCE_OPTIONS = [5, 10, 25, 50, 100] as const;

export const DEFAULT_HOME_DISTANCE_KM: HomeDistanceKm = 25;

export type HomeDistanceKm = (typeof HOME_DISTANCE_OPTIONS)[number];

function formatStateLabel(state: string): string {
  if (!state) return "";
  return state === "FCT" ? "Abuja" : state;
}

export function normalizeHomeDistanceKm(value?: number | null): HomeDistanceKm {
  if (value != null && (HOME_DISTANCE_OPTIONS as readonly number[]).includes(value)) {
    return value as HomeDistanceKm;
  }
  return DEFAULT_HOME_DISTANCE_KM;
}

export function resolveLocationState(city: string, state: string): string {
  return state || (city ? stateForCity(city) || "" : "");
}

/** e.g. Banana Island, Lagos */
export function formatCityWithState(city: string, state: string): string {
  const resolvedState = formatStateLabel(resolveLocationState(city, state));
  if (city && resolvedState) return `${city}, ${resolvedState}`;
  if (city) return city;
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
