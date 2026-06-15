import { intentDisplay } from "../constants/intents";
import type { DatingProfile, MatchPreferences } from "../types";

/** Short chips for own profile highlights footer */
export function getOwnProfileChips(profile: DatingProfile, prefs: MatchPreferences): string[] {
  const chips: string[] = [];

  if (profile.intents.length) {
    chips.push(intentDisplay(profile.intents[0]));
  } else if (prefs.intents.length) {
    chips.push(intentDisplay(prefs.intents[0]));
  }

  if (profile.city?.trim()) {
    chips.push(profile.city);
  } else if (prefs.cities.length) {
    chips.push(prefs.cities[0]);
  }

  chips.push(prefs.preferenceMode === "strict" ? "Strict matching" : "Flexible matching");

  return chips.filter(Boolean).slice(0, 3);
}
