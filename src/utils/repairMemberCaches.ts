import { STORAGE_KEYS } from "../constants/limits";
import { normalizeDatingProfile, normalizeMatchPreferences } from "./profile";
import { safeUserProfile } from "./safeProfile";
import { readJson, writeJson } from "./storage";

/** Strip broken preview URLs and malformed profile JSON before React renders. */
export function repairMemberCaches(): void {
  try {
    writeJson(
      STORAGE_KEYS.datingProfile,
      normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}))
    );
    writeJson(
      STORAGE_KEYS.matchPreferences,
      normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}))
    );
    writeJson(STORAGE_KEYS.userProfile, safeUserProfile(readJson(STORAGE_KEYS.userProfile, {})));
  } catch {
    /* never block boot */
  }
}
