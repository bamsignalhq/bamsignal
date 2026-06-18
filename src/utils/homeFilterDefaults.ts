import {
  DEFAULT_HOME_DISTANCE_KM,
  normalizeHomeDistanceKm
} from "../constants/homeFilters";
import { stateForCity } from "../constants/profileOptions";
import type { DatingProfile, MatchPreferences } from "../types";
import { clampHomeDistanceForCity } from "./cityMetroRadius";
import { getMemberCity } from "./memberCity";
import { resolveSearchLocationFromPrefs, sanitizeStateCityPair } from "./searchLocationPrefs";

export type HomeFilterDefaults = {
  ageMin: number;
  ageMax: number;
  city: string;
  state: string;
  searchCities: string[];
  distanceKm: number;
};

/** Age range from saved prefs, or a sensible band around the member's age. */
function resolveDefaultAgeRange(
  viewer: DatingProfile,
  prefs: MatchPreferences
): { ageMin: number; ageMax: number } {
  const memberAge = viewer.age ?? 25;
  const ageMin = prefs.ageMin ?? Math.max(18, memberAge - 7);
  const ageMax = prefs.ageMax ?? Math.min(99, memberAge + 10);
  if (ageMin <= ageMax) return { ageMin, ageMax };
  return { ageMin: Math.max(18, memberAge - 7), ageMax: Math.min(99, memberAge + 10) };
}

/**
 * Home feed filter defaults from saved search preferences, then profile location.
 */
export function resolveHomeFilterDefaults(
  viewer: DatingProfile,
  prefs: MatchPreferences
): HomeFilterDefaults {
  const search = resolveSearchLocationFromPrefs(prefs);
  let city = viewer.city?.trim() || getMemberCity() || "";
  let state = viewer.state?.trim() || (city ? stateForCity(city) || "" : "");

  if (search.state) {
    state = search.state;
    city = search.primaryCity;
  } else if (search.cities.length) {
    city = search.primaryCity;
    state = stateForCity(city) || state;
  }

  const aligned = sanitizeStateCityPair(state, city);
  state = aligned.state;
  city = aligned.city;
  const { ageMin, ageMax } = resolveDefaultAgeRange(viewer, prefs);
  const distanceKm = clampHomeDistanceForCity(
    city,
    state,
    normalizeHomeDistanceKm(prefs.distanceMax ?? DEFAULT_HOME_DISTANCE_KM)
  );

  return { ageMin, ageMax, city, state, searchCities: search.cities, distanceKm };
}
