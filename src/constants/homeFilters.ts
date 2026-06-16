export const HOME_DISTANCE_OPTIONS = [5, 10, 25, 50, 100] as const;

export type HomeDistanceKm = (typeof HOME_DISTANCE_OPTIONS)[number];

export function formatHomeLocationSummary(
  city: string,
  state: string,
  distanceKm: number | null
): string {
  const stateLabel = state === "FCT" ? "Abuja" : state;
  const distanceSuffix = distanceKm != null ? ` • ${distanceKm}km` : "";

  if (city) {
    return `${city}${distanceSuffix}`;
  }
  if (state) {
    return `${stateLabel}${distanceSuffix}`;
  }
  if (distanceKm != null) {
    return `Anywhere • ${distanceKm}km`;
  }
  return "Anywhere";
}

export function firstNameFromDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "there";
  return trimmed.split(/\s+/)[0];
}
