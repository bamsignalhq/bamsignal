import {
  citiesForState,
  cityBelongsToState,
  resolveStateName,
  stateForCity
} from "../constants/profileOptions";
import type { MatchPreferences } from "../types";
import { formatMultiSelectSummary } from "./selectSummary";

export const MAX_SEARCH_CITIES = 5;
export const SEARCH_CITIES_LIMIT_MESSAGE = "Choose up to 5 cities.";

/** First selected search state from match preferences (single-select). */
export function searchStateFromPrefs(prefs: Pick<MatchPreferences, "states">): string | undefined {
  const raw = prefs.states?.[0];
  if (!raw?.trim()) return undefined;
  return resolveStateName(raw) || raw.trim();
}

/** Dedupe search cities, keep only cities in the selected state, cap at MAX_SEARCH_CITIES. */
export function normalizeSearchCities(cities: unknown, state?: string): string[] {
  const resolvedState = state?.trim() ? resolveStateName(state) || state.trim() : undefined;
  const allowed = resolvedState ? new Set(citiesForState(resolvedState)) : null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of Array.isArray(cities) ? cities : []) {
    if (typeof raw !== "string") continue;
    const city = raw.trim();
    if (!city || seen.has(city)) continue;
    if (allowed && !allowed.has(city)) continue;
    if (resolvedState && !cityBelongsToState(city, resolvedState)) continue;
    seen.add(city);
    out.push(city);
    if (out.length >= MAX_SEARCH_CITIES) break;
  }
  return out;
}

/** Compact label for home/discover filter summaries. */
export function formatSearchLocationSummary(
  state: string | undefined,
  cities: string[]
): string {
  const resolvedState = state ? resolveStateName(state) || state : "";
  const stateLabel = resolvedState === "FCT" ? "Abuja" : resolvedState;

  if (cities.length > 0) {
    const citiesLabel = formatMultiSelectSummary(cities, (c) => c, "");
    if (stateLabel) return `${citiesLabel}, ${stateLabel}`;
    return citiesLabel;
  }

  if (stateLabel) return stateLabel;
  return "Set location";
}

/** Prefer saved search state/cities over profile location for browsing. */
export function resolveSearchLocationFromPrefs(prefs: MatchPreferences): {
  state: string;
  cities: string[];
  primaryCity: string;
} {
  const state = searchStateFromPrefs(prefs) || "";
  const cities = normalizeSearchCities(prefs.cities, state || undefined);
  return {
    state,
    cities,
    primaryCity: cities[0] || ""
  };
}

/** Update search state and clear cities when the state changes. */
export function withSearchStateChange(
  prefs: MatchPreferences,
  searchState: string | undefined
): MatchPreferences {
  const previous = searchStateFromPrefs(prefs);
  const nextState = searchState?.trim() ? resolveStateName(searchState) || searchState.trim() : "";
  return {
    ...prefs,
    states: nextState ? [nextState] : [],
    cities:
      nextState && nextState === previous
        ? normalizeSearchCities(prefs.cities, nextState)
        : []
  };
}

/** Keep state/city aligned — drop cities that do not belong to the selected state. */
export function sanitizeStateCityPair(state: string, city: string): { state: string; city: string } {
  const resolvedState = resolveStateName(state) || state.trim();
  if (!resolvedState) {
    const fromCity = city ? stateForCity(city) : undefined;
    return { state: fromCity || "", city: fromCity && cityBelongsToState(city, fromCity) ? city : "" };
  }
  if (!city) return { state: resolvedState, city: "" };
  if (cityBelongsToState(city, resolvedState)) {
    return { state: resolvedState, city };
  }
  return { state: resolvedState, city: "" };
}
