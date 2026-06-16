import {
  DEFAULT_HOME_DISTANCE_KM,
  MAX_HOME_DISTANCE_KM,
  MIN_HOME_DISTANCE_KM
} from "../constants/homeFilters";

/** Max discovery radius from any supported city — uniform far reach per city. */
export function getCityMetroRadiusKm(_city?: string, _state = ""): number {
  return MAX_HOME_DISTANCE_KM;
}

export function clampHomeDistanceForCity(city: string, state: string, distanceKm: number): number {
  const max = getCityMetroRadiusKm(city, state);
  const min = MIN_HOME_DISTANCE_KM;
  if (!Number.isFinite(distanceKm)) {
    return Math.min(DEFAULT_HOME_DISTANCE_KM, max);
  }
  return Math.round(Math.min(max, Math.max(min, distanceKm)));
}

/** Selected filter radius, capped to the city's max reach. */
export function effectiveHomeDistanceKm(city: string, state: string, distanceKm: number): number {
  return clampHomeDistanceForCity(city, state, distanceKm);
}
