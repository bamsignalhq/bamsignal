import { intentDisplay } from "../constants/intents";
import type { DatingProfile, IntentTag, MatchPreferences } from "../types";
import { safeArray } from "./safeProfile";

/** Short chips for own profile highlights footer */
export function getOwnProfileChips(profile: DatingProfile, prefs: MatchPreferences): string[] {
  const chips: string[] = [];

  const intents = safeArray<IntentTag>(profile.intents);
  if (intents.length) {
    chips.push(intentDisplay(intents[0]));
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
