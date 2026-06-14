import { STORAGE_KEYS } from "../constants/limits";
import { defaultSafetySettings } from "../constants/safety";
import { normalizeIntents } from "../constants/intents";
import { stateForCity } from "../constants/profileOptions";
import type { DatingProfile, MatchPreferences } from "../types";
import { readJson } from "./storage";

export const defaultDatingProfile = (): DatingProfile => ({
  photos: [],
  age: 25,
  gender: "Prefer not to say",
  state: "Lagos",
  city: "Lagos",
  bio: "",
  lookingFor: "Everyone",
  intents: ["Relationship"],
  interests: [],
  verified: false,
  premium: false,
  onboardingComplete: false,
  createdAt: new Date().toISOString(),
  reportCount: 0,
  visibility: { showReligion: false, showEthnicity: false, showState: false },
  matchingPrivacy: {
    useReligionForMatching: true,
    useEthnicityForMatching: true,
    useStateForMatching: true
  },
  safetySettings: defaultSafetySettings()
});

export const defaultMatchPreferences = (): MatchPreferences => ({
  religions: [],
  ethnicities: [],
  lifestyles: [],
  cities: [],
  states: [],
  intents: [],
  preferenceMode: "flexible"
});

export function getDatingProfile(): DatingProfile {
  return normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
}

export function getMatchPreferences(): MatchPreferences {
  return normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
}

export function isOnboardingComplete(): boolean {
  const profile = getDatingProfile();
  return Boolean(profile.onboardingComplete && profile.bio.trim() && profile.photos.length > 0);
}

export function isPreferNot(value?: string): boolean {
  return !value || value === "Prefer not to say";
}

export function normalizeDatingProfile(raw: Partial<DatingProfile>): DatingProfile {
  const base = defaultDatingProfile();
  const city = raw.city ?? base.city;
  const state = raw.state ?? stateForCity(city) ?? base.state;
  return {
    ...base,
    ...raw,
    state,
    city,
    intents: normalizeIntents(raw.intents as string[] | undefined),
    interests: raw.interests ?? base.interests,
    visibility: { ...base.visibility!, ...raw.visibility },
    matchingPrivacy: { ...base.matchingPrivacy!, ...raw.matchingPrivacy },
    safetySettings: { ...defaultSafetySettings(raw.gender ?? base.gender), ...raw.safetySettings },
    createdAt: raw.createdAt ?? base.createdAt ?? new Date().toISOString()
  };
}

export function normalizeMatchPreferences(raw: Partial<MatchPreferences>): MatchPreferences {
  const base = defaultMatchPreferences();
  return {
    ...base,
    ...raw,
    states: raw.states ?? base.states,
    preferenceMode: raw.preferenceMode ?? base.preferenceMode,
    onlineNow: raw.onlineNow ?? false,
    minCompatibility: raw.minCompatibility,
    requireVoiceIntro: raw.requireVoiceIntro ?? false,
    requireVerified: raw.requireVerified ?? false,
    intents: raw.intents?.length ? normalizeIntents(raw.intents as string[]) : base.intents
  };
}
