import type { DiscoverProfile } from "../types";

export const SAVED_PROFILES_TITLE = "Saved Profiles";
export const SAVE_PROFILE_LABEL = "Save Profile";
export const SAVED_PROFILE_LABEL = "Saved ✓";
export const SAVED_PROFILE_TOAST = "Saved for later 💜";
export const REMOVED_PROFILE_TOAST = "Removed from saved";

export const SAVED_PROFILES_EMPTY_HEADLINE = "Nothing saved yet";
export const SAVED_PROFILES_EMPTY_SUBTEXT =
  "Interesting people you save will appear here.";

export type SavedProfileFilter =
  | "all"
  | "trusted"
  | "same-city"
  | "voice-vibe"
  | "relationship";

export const SAVED_PROFILE_FILTERS: { id: SavedProfileFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "trusted", label: "Trusted Members" },
  { id: "same-city", label: "Same City" },
  { id: "voice-vibe", label: "With Voice Vibe" },
  { id: "relationship", label: "Relationship-focused" }
];

/** Reserved for future products — not implemented. */
export type SavedProfilesFutureTier =
  | "collections"
  | "notes"
  | "hidden-profiles"
  | "circle-recommendations";

export type SavedProfilesFutureConfig = {
  tier?: SavedProfilesFutureTier;
  collectionId?: string;
  circleId?: string;
};

export type SavedProfileEntry = {
  profileId: string;
  savedAt: string;
};

export type SavedDiscoverProfile = DiscoverProfile & {
  savedAt?: string;
};

export const SAVED_PROFILES_CHANGED_EVENT = "bamsignal:saved-profiles-changed";

export function dispatchSavedProfilesChanged(): void {
  window.dispatchEvent(new CustomEvent(SAVED_PROFILES_CHANGED_EVENT));
}
