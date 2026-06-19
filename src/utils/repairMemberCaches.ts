import { STORAGE_KEYS } from "../constants/limits";
import { normalizeDatingProfile, normalizeMatchPreferences } from "./profile";
import { normalizeHomeAdvancedFilters } from "./homeFilters";
import { safeUserProfile } from "./safeProfile";
import { readJson, writeJson } from "./storage";
import { normalizeCompliance } from "./compliance";

/** Strip broken preview URLs and malformed profile JSON before React renders. */
export function repairMemberCaches(): void {
  try {
    const rawProfile = readJson<Record<string, unknown>>(STORAGE_KEYS.datingProfile, {});
    const normalizedProfile = normalizeDatingProfile({
      ...rawProfile,
      photos: Array.isArray(rawProfile.photos) ? rawProfile.photos : [],
      interests: Array.isArray(rawProfile.interests) ? rawProfile.interests : [],
      compliance: normalizeCompliance(rawProfile.compliance)
    });
    writeJson(STORAGE_KEYS.datingProfile, normalizedProfile);

    const rawPrefs = readJson<Record<string, unknown>>(STORAGE_KEYS.matchPreferences, {});
    writeJson(
      STORAGE_KEYS.matchPreferences,
      normalizeMatchPreferences({
        ...rawPrefs,
        ethnicities: Array.isArray(rawPrefs.ethnicities) ? rawPrefs.ethnicities : [],
        religions: Array.isArray(rawPrefs.religions) ? rawPrefs.religions : [],
        lifestyles: Array.isArray(rawPrefs.lifestyles) ? rawPrefs.lifestyles : [],
        cities: Array.isArray(rawPrefs.cities) ? rawPrefs.cities : [],
        states: Array.isArray(rawPrefs.states) ? rawPrefs.states : [],
        statesOfOrigin: Array.isArray(rawPrefs.statesOfOrigin) ? rawPrefs.statesOfOrigin : [],
        intents: Array.isArray(rawPrefs.intents) ? rawPrefs.intents : [],
        occupations: Array.isArray(rawPrefs.occupations) ? rawPrefs.occupations : [],
        genotypes: Array.isArray(rawPrefs.genotypes) ? rawPrefs.genotypes : [],
        bodyTypes: Array.isArray(rawPrefs.bodyTypes) ? rawPrefs.bodyTypes : [],
        relationshipIntentions: Array.isArray(rawPrefs.relationshipIntentions)
          ? rawPrefs.relationshipIntentions
          : [],
        hasKids: Array.isArray(rawPrefs.hasKids) ? rawPrefs.hasKids : [],
        wantsKids: Array.isArray(rawPrefs.wantsKids) ? rawPrefs.wantsKids : [],
        verificationPreferences: Array.isArray(rawPrefs.verificationPreferences)
          ? rawPrefs.verificationPreferences
          : [],
        kidsPreferences: Array.isArray(rawPrefs.kidsPreferences) ? rawPrefs.kidsPreferences : []
      })
    );
    writeJson(STORAGE_KEYS.userProfile, safeUserProfile(readJson(STORAGE_KEYS.userProfile, {})));

    const savedSearches = readJson<Array<{ advanced?: unknown }>>(STORAGE_KEYS.savedSearches, []);
    if (Array.isArray(savedSearches) && savedSearches.length) {
      writeJson(
        STORAGE_KEYS.savedSearches,
        savedSearches.map((entry) => ({
          ...entry,
          advanced: normalizeHomeAdvancedFilters(entry.advanced as never)
        }))
      );
    }
  } catch {
    /* never block boot */
  }
}
