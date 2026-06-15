import { intentDisplay } from "../constants/intents";
import type { DatingProfile, MatchPreferences } from "../types";

/** Short read-only compatibility line for own profile overview */
export function getOwnCompatibilitySummary(profile: DatingProfile, prefs: MatchPreferences): string | null {
  const parts: string[] = [];

  if (prefs.preferenceMode === "strict") parts.push("Strict matching");
  else parts.push("Flexible matching");

  if (prefs.cities.length) {
    parts.push(prefs.cities.slice(0, 2).join(", "));
  } else if (profile.city) {
    parts.push(profile.city);
  }

  if (prefs.intents.length) {
    parts.push(
      prefs.intents.length > 1
        ? "multiple intents"
        : intentDisplay(prefs.intents[0]).toLowerCase()
    );
  } else if (profile.intents.length) {
    parts.push(intentDisplay(profile.intents[0]).toLowerCase());
  }

  return parts.length ? parts.join(" · ") : null;
}
