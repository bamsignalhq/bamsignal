import { intentDisplay } from "../constants/intents";
import type {
  DiscoverProfile,
  EthnicBackground,
  Genotype,
  HomeAdvancedFilters,
  IntentTag,
  KidsPreference,
  MatchPreferences,
  Occupation,
  Religion,
  SavedSearch
} from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type { HomeAdvancedFilters };

export const emptyHomeAdvancedFilters = (): HomeAdvancedFilters => ({
  tribes: [],
  religions: [],
  occupations: [],
  statesOfOrigin: [],
  relationshipIntentions: [],
  genotypes: [],
  hasKids: [],
  wantsKids: [],
  verifiedOnly: false
});

export function homeAdvancedFilterCount(filters: HomeAdvancedFilters): number {
  return (
    filters.tribes.length +
    filters.religions.length +
    filters.occupations.length +
    filters.statesOfOrigin.length +
    filters.relationshipIntentions.length +
    filters.genotypes.length +
    filters.hasKids.length +
    filters.wantsKids.length +
    (filters.verifiedOnly ? 1 : 0)
  );
}

export function homeAdvancedToSearchFilters(filters: HomeAdvancedFilters) {
  const kidsPreferences = [...new Set([...filters.hasKids, ...filters.wantsKids])];
  return {
    tribes: filters.tribes,
    religions: filters.religions,
    occupations: filters.occupations,
    statesOfOrigin: filters.statesOfOrigin,
    relationshipIntentions: filters.relationshipIntentions,
    genotypes: filters.genotypes,
    kidsPreferences
  };
}

export function advancedFromMatchPreferences(prefs: MatchPreferences): HomeAdvancedFilters {
  const kids: KidsPreference[] = prefs.kidsPreferences ?? [];
  return {
    tribes: prefs.ethnicities ?? [],
    religions: prefs.religions ?? [],
    occupations: [],
    statesOfOrigin: prefs.states ?? [],
    relationshipIntentions: prefs.intents ?? [],
    genotypes: [],
    hasKids: kids.filter((k) => k === "Has kids" || k === "No kids"),
    wantsKids: kids.filter((k) => k !== "Has kids" && k !== "No kids"),
    verifiedOnly: Boolean(prefs.requireVerified)
  };
}

export type HomeFilterChip = { id: string; label: string; kind: string; value: string };

export function buildHomeFilterChips(options: {
  ageMin: number;
  ageMax: number;
  city: string;
  state: string;
  advanced: HomeAdvancedFilters;
}): HomeFilterChip[] {
  const chips: HomeFilterChip[] = [];
  const { ageMin, ageMax, city, state, advanced } = options;

  if (ageMin || ageMax) {
    chips.push({ id: "age", label: `${ageMin}–${ageMax}`, kind: "age", value: `${ageMin}-${ageMax}` });
  }
  if (city) {
    chips.push({ id: `city-${city}`, label: city, kind: "city", value: city });
  } else if (state) {
    chips.push({ id: `state-${state}`, label: state === "FCT" ? "Abuja" : state, kind: "state", value: state });
  }

  for (const tribe of advanced.tribes) {
    chips.push({ id: `tribe-${tribe}`, label: tribe, kind: "tribe", value: tribe });
  }
  for (const religion of advanced.religions) {
    chips.push({ id: `religion-${religion}`, label: religion, kind: "religion", value: religion });
  }
  for (const occupation of advanced.occupations) {
    chips.push({ id: `occupation-${occupation}`, label: occupation, kind: "occupation", value: occupation });
  }
  for (const origin of advanced.statesOfOrigin) {
    chips.push({
      id: `origin-${origin}`,
      label: origin === "FCT" ? "Abuja" : origin,
      kind: "origin",
      value: origin
    });
  }
  for (const intent of advanced.relationshipIntentions) {
    chips.push({
      id: `intent-${intent}`,
      label: intentDisplay(intent),
      kind: "intent",
      value: intent
    });
  }
  for (const genotype of advanced.genotypes) {
    chips.push({ id: `genotype-${genotype}`, label: genotype, kind: "genotype", value: genotype });
  }
  for (const pref of advanced.hasKids) {
    chips.push({ id: `hasKids-${pref}`, label: pref, kind: "hasKids", value: pref });
  }
  for (const pref of advanced.wantsKids) {
    chips.push({ id: `wantsKids-${pref}`, label: pref, kind: "wantsKids", value: pref });
  }
  if (advanced.verifiedOnly) {
    chips.push({ id: "verified", label: "Verified only", kind: "verified", value: "true" });
  }

  return chips;
}

export function buildHomeAdvancedChips(
  advanced: HomeAdvancedFilters,
  options?: { city?: string; state?: string }
): HomeFilterChip[] {
  let chips = buildHomeFilterChips({
    ageMin: 0,
    ageMax: 0,
    city: "",
    state: "",
    advanced
  });

  if (options?.city) {
    const locationState = options.state || "";
    chips = chips.filter(
      (chip) =>
        chip.kind !== "state" &&
        !(chip.kind === "origin" && locationState && chip.value === locationState)
    );
  }

  return chips;
}

export function homeHasCustomFilters(options: {
  ageMin: number;
  ageMax: number;
  city: string;
  state: string;
  distanceKm: number;
  advanced: HomeAdvancedFilters;
  defaultAgeMin: number;
  defaultAgeMax: number;
  defaultCity: string;
  defaultState: string;
  defaultDistanceKm: number;
}): boolean {
  const {
    ageMin,
    ageMax,
    city,
    state,
    distanceKm,
    advanced,
    defaultAgeMin,
    defaultAgeMax,
    defaultCity,
    defaultState,
    defaultDistanceKm
  } = options;

  if (ageMin !== defaultAgeMin || ageMax !== defaultAgeMax) return true;
  if (city !== defaultCity || state !== defaultState) return true;
  if (distanceKm !== defaultDistanceKm) return true;
  return homeAdvancedFilterCount(advanced) > 0;
}

export function filterProfilesByDistance(profiles: DiscoverProfile[], maxKm: number): DiscoverProfile[] {
  return profiles.filter((profile) => profile.distanceKm == null || profile.distanceKm <= maxKm);
}

export function removeHomeFilterChip(
  advanced: HomeAdvancedFilters,
  chip: HomeFilterChip,
  ageMin: number,
  ageMax: number,
  city: string,
  state: string
): {
  advanced: HomeAdvancedFilters;
  ageMin: number;
  ageMax: number;
  city: string;
  state: string;
} {
  const next = { ...advanced };
  let nextAgeMin = ageMin;
  let nextAgeMax = ageMax;
  let nextCity = city;
  let nextState = state;

  switch (chip.kind) {
    case "age":
      nextAgeMin = 18;
      nextAgeMax = 99;
      break;
    case "city":
      nextCity = "";
      break;
    case "state":
      nextState = "";
      break;
    case "tribe":
      next.tribes = next.tribes.filter((v) => v !== chip.value);
      break;
    case "religion":
      next.religions = next.religions.filter((v) => v !== chip.value);
      break;
    case "occupation":
      next.occupations = next.occupations.filter((v) => v !== chip.value);
      break;
    case "origin":
      next.statesOfOrigin = next.statesOfOrigin.filter((v) => v !== chip.value);
      break;
    case "intent":
      next.relationshipIntentions = next.relationshipIntentions.filter((v) => v !== chip.value);
      break;
    case "genotype":
      next.genotypes = next.genotypes.filter((v) => v !== chip.value);
      break;
    case "hasKids":
      next.hasKids = next.hasKids.filter((v) => v !== chip.value);
      break;
    case "wantsKids":
      next.wantsKids = next.wantsKids.filter((v) => v !== chip.value);
      break;
    case "verified":
      next.verifiedOnly = false;
      break;
    default:
      break;
  }

  return { advanced: next, ageMin: nextAgeMin, ageMax: nextAgeMax, city: nextCity, state: nextState };
}

function buildSavedSearchLabel(city: string, advanced: HomeAdvancedFilters): string {
  const parts: string[] = [];
  if (city) parts.push(city);
  if (advanced.religions[0]) parts.push(advanced.religions[0]);
  if (advanced.tribes[0]) parts.push(advanced.tribes[0]);
  if (advanced.relationshipIntentions[0]) {
    parts.push(intentDisplay(advanced.relationshipIntentions[0]));
  }
  return parts.slice(0, 3).join(" ") || "Saved search";
}

export function getSavedSearches(): SavedSearch[] {
  return readJson<SavedSearch[]>(STORAGE_KEYS.savedSearches, []);
}

export function saveHomeSearch(options: {
  ageMin: number;
  ageMax: number;
  state: string;
  city: string;
  advanced: HomeAdvancedFilters;
  resultCount: number;
}): SavedSearch {
  const searches = getSavedSearches();
  const entry: SavedSearch = {
    id: `search-${Date.now()}`,
    label: buildSavedSearchLabel(options.city, options.advanced),
    resultCount: options.resultCount,
    ageMin: options.ageMin,
    ageMax: options.ageMax,
    state: options.state,
    city: options.city,
    advanced: options.advanced,
    savedAt: new Date().toISOString()
  };
  writeJson(STORAGE_KEYS.savedSearches, [entry, ...searches].slice(0, 12));
  return entry;
}

export function deleteSavedSearch(id: string): void {
  writeJson(
    STORAGE_KEYS.savedSearches,
    getSavedSearches().filter((s) => s.id !== id)
  );
}
