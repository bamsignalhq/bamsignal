import { EXPANSION_CITIES, LAUNCH_PRIMARY_CITIES } from "../constants/seedCities";
import { metroForCity, stateForCity } from "../constants/profileOptions";
import {
  DEFAULT_HOME_DISTANCE_KM,
  HOME_DISTANCE_OPTIONS,
  type HomeDistanceKm
} from "../constants/homeFilters";

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

  // Satellite towns in the Lagos corridor still use Lagos reach.
  if (resolvedState === "Ogun" && ["Abeokuta", "Sagamu", "Ota", "Mowe", "Agbara"].includes(city)) {
    return 30;
  }

  return 22;
}

export function distanceOptionsForCity(city: string, state = ""): HomeDistanceKm[] {
  const maxRadius = getCityMetroRadiusKm(city, state);
  const options = HOME_DISTANCE_OPTIONS.filter((km) => km <= maxRadius);
  return options.length ? options : [DEFAULT_HOME_DISTANCE_KM];
}

export function clampHomeDistanceForCity(city: string, state: string, distanceKm: number): HomeDistanceKm {
  const options = distanceOptionsForCity(city, state);
  if (options.includes(distanceKm as HomeDistanceKm)) {
    return distanceKm as HomeDistanceKm;
  }
  const within = options.filter((km) => km <= distanceKm);
  if (within.length) return within[within.length - 1];
  if (options.includes(DEFAULT_HOME_DISTANCE_KM)) return DEFAULT_HOME_DISTANCE_KM;
  return options[options.length - 1];
}

/** Selected filter radius, capped to the city's metro model. */
export function effectiveHomeDistanceKm(city: string, state: string, distanceKm: number): number {
  return Math.min(distanceKm, getCityMetroRadiusKm(city, state));
}
