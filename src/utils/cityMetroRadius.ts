import { EXPANSION_CITIES, LAUNCH_PRIMARY_CITIES } from "../constants/seedCities";
import { metroForCity, stateForCity } from "../constants/profileOptions";
import { DEFAULT_HOME_DISTANCE_KM, MIN_HOME_DISTANCE_KM } from "../constants/homeFilters";

/**
 * Lagos metropolitan reach is ~40–50 km from the urban core (Lagos Island).
 * Other cities use the same tier model, scaled to realistic metro sprawl.
 */
const LAGOS_METRO_RADIUS_KM = 50;

const METRO_RADIUS_KM: Record<string, number> = {
  Lagos: LAGOS_METRO_RADIUS_KM,
  Abuja: 40,
  "Port Harcourt": 35,
  Ibadan: 30,
  Kano: 35,
  Kaduna: 30,
  Benin: 28,
  Enugu: 25,
  Owerri: 25,
  Uyo: 25,
  Aba: 25,
  Asaba: 22,
  Calabar: 22,
  Warri: 28,
  Abeokuta: 25,
  Jos: 25,
  Maiduguri: 28,
  Sokoto: 22,
  Onitsha: 25,
  Awka: 22
};

const STATE_METRO_RADIUS_KM: Record<string, number> = {
  Lagos: LAGOS_METRO_RADIUS_KM,
  FCT: 40,
  Rivers: 35,
  Oyo: 30,
  Kano: 35,
  Kaduna: 30
};

function launchTierRadius(city: string): number | null {
  if ((LAUNCH_PRIMARY_CITIES as readonly string[]).includes(city)) {
    if (city === "Lagos") return LAGOS_METRO_RADIUS_KM;
    if (city === "Abuja") return 40;
    return 35;
  }
  if ((EXPANSION_CITIES as readonly string[]).includes(city)) return 25;
  return null;
}

/** Max practical dating radius from a city center — never beyond metro sprawl. */
export function getCityMetroRadiusKm(city: string, state = ""): number {
  const resolvedState = state || stateForCity(city) || "";
  const metro = metroForCity(city) || city;

  if (METRO_RADIUS_KM[metro]) return METRO_RADIUS_KM[metro];
  if (METRO_RADIUS_KM[city]) return METRO_RADIUS_KM[city];

  const launchRadius = launchTierRadius(metro) ?? launchTierRadius(city);
  if (launchRadius != null) return launchRadius;

  if (resolvedState && STATE_METRO_RADIUS_KM[resolvedState]) {
    return STATE_METRO_RADIUS_KM[resolvedState];
  }

  if (resolvedState === "Ogun" && ["Abeokuta", "Sagamu", "Ota", "Mowe", "Agbara"].includes(city)) {
    return 30;
  }

  return 22;
}

export function clampHomeDistanceForCity(city: string, state: string, distanceKm: number): number {
  const max = getCityMetroRadiusKm(city, state);
  const min = MIN_HOME_DISTANCE_KM;
  if (!Number.isFinite(distanceKm)) {
    return Math.min(DEFAULT_HOME_DISTANCE_KM, max);
  }
  return Math.round(Math.min(max, Math.max(min, distanceKm)));
}

/** Selected filter radius, capped to the city's metro model. */
export function effectiveHomeDistanceKm(city: string, state: string, distanceKm: number): number {
  return clampHomeDistanceForCity(city, state, distanceKm);
}
