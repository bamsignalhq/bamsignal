import type { MatchPreferences } from "../types";

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
    cities: nextState && nextState === previous ? prefs.cities : []
  };
}
