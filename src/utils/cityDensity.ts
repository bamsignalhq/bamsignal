import { LAUNCH_PRIMARY_CITIES } from "../constants/seedCities";
import type { DatingProfile, DiscoverProfile, MatchPreferences } from "../types";
import { buildDiscoveryDeck, countSameCityProfiles } from "./launchSeed";
import { milesToKm } from "./discoverLocation";

const MIN_SAME_CITY = 3;
const LOW_DENSITY_RADIUS_KM = milesToKm(120);

export type DensityState = {
  sameCityCount: number;
  expanded: boolean;
  message?: string;
};

export function assessCityDensity(
  candidates: DiscoverProfile[],
  viewerCity: string,
  blocked: string[],
  passed: string[]
): DensityState {
  const sameCityCount = countSameCityProfiles(candidates, viewerCity, blocked, passed);
  const isPriorityCity = LAUNCH_PRIMARY_CITIES.includes(
    viewerCity as (typeof LAUNCH_PRIMARY_CITIES)[number]
  );

  if (sameCityCount >= MIN_SAME_CITY) {
    return { sameCityCount, expanded: false };
  }

  return {
    sameCityCount,
    expanded: true,
    message: isPriorityCity
      ? `Showing compatible profiles from nearby cities while ${viewerCity} grows.`
      : `Expanding discovery — more profiles from Lagos, Abuja & Port Harcourt.`
  };
}

/** Never return an empty deck when candidates exist — expand radius intelligently */
export function buildDensityAwareDeck(
  candidates: DiscoverProfile[],
  viewer: DatingProfile,
  prefs: MatchPreferences,
  blocked: string[],
  passed: string[]
): { deck: DiscoverProfile[]; density: DensityState } {
  const density = assessCityDensity(candidates, viewer.city, blocked, passed);
  let deck = buildDiscoveryDeck(candidates, viewer, prefs);

  if (deck.length > 0) return { deck, density };

  const expandedPrefs: MatchPreferences = {
    ...prefs,
    distanceMax: Math.max(prefs.distanceMax ?? 0, LOW_DENSITY_RADIUS_KM),
    cities: [],
    preferenceMode: "flexible"
  };

  deck = buildDiscoveryDeck(candidates, viewer, expandedPrefs);

  if (deck.length === 0) {
    deck = buildDiscoveryDeck(
      candidates.filter((p) => LAUNCH_PRIMARY_CITIES.includes(p.city as never)),
      viewer,
      expandedPrefs
    );
  }

  return {
    deck,
    density: {
      ...density,
      expanded: true,
      message: density.message ?? "Showing profiles from launch cities."
    }
  };
}
