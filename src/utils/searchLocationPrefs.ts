import { citiesForState } from "../constants/profileOptions";
import type { MatchPreferences } from "../types";

export const MAX_SEARCH_CITIES = 5;
export const SEARCH_CITIES_LIMIT_MESSAGE = "Choose up to 5 cities.";

/** Dedupe search cities, keep only cities in the selected state, cap at MAX_SEARCH_CITIES. */
export function normalizeSearchCities(cities: unknown, state?: string): string[] {
  const allowed = state?.trim() ? new Set(citiesForState(state.trim())) : null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of Array.isArray(cities) ? cities : []) {
    if (typeof raw !== "string") continue;
    const city = raw.trim();
    if (!city || seen.has(city)) continue;
    if (allowed && !allowed.has(city)) continue;
    seen.add(city);
    out.push(city);
    if (out.length >= MAX_SEARCH_CITIES) break;
  }
  return out;
}

/** First selected search state from match preferences (single-select). */
export function searchStateFromPrefs(prefs: Pick<MatchPreferences, "states">): string | undefined {
  const state = prefs.states?.[0];
  return state?.trim() || undefined;
}

/** Update search state and clear cities when the state changes. */
export function withSearchStateChange(
  prefs: MatchPreferences,
  searchState: string | undefined
): MatchPreferences {
  const previous = searchStateFromPrefs(prefs);
  const nextState = searchState?.trim() || "";
  return {
    ...prefs,
    states: nextState ? [nextState] : [],
    cities:
      nextState && nextState === previous
        ? normalizeSearchCities(prefs.cities, nextState)
        : []
  };
}
