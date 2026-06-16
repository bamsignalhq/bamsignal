import { ageFromDateOfBirth, defaultAdultDob } from "./ageFromDob";
import { STORAGE_KEYS } from "../constants/limits";
import { MIN_PROFILE_PHOTOS } from "../constants/photos";
import { defaultSafetySettings } from "../constants/safety";
import { normalizeIntents } from "../constants/intents";
import { stateForCity } from "../constants/profileOptions";
import type { DatingProfile, MatchPreferences } from "../types";
import { readJson } from "./storage";
import { samePhotoRef } from "./photoRefs";

export const defaultDatingProfile = (): DatingProfile => ({
  photos: [],
  coverPhoto: undefined,
  age: 25,
  dateOfBirth: defaultAdultDob(),
  gender: "Man",
  state: "Abia",
  city: "",
  bio: "",
  lookingFor: "Women",
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
  preferenceMode: "flexible",
  kidsPreferences: []
});

export function getDatingProfile(): DatingProfile {
  return normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
}

export function getMatchPreferences(): MatchPreferences {
  return normalizeMatchPreferences(readJson(STORAGE_KEYS.matchPreferences, {}));
}

export function isOnboardingComplete(): boolean {
  const profile = getDatingProfile();
  return Boolean(
    profile.onboardingComplete &&
      profile.bio.trim() &&
      profile.photos.length >= MIN_PROFILE_PHOTOS
  );
}

export function isPreferNot(value?: string): boolean {
  return !value || value === "Prefer not to say";
}

export function normalizeDatingProfile(raw: Partial<DatingProfile>): DatingProfile {
  const base = defaultDatingProfile();
  const city = raw.city ?? base.city;
  const state = raw.state ?? stateForCity(city) ?? base.state;
  const dateOfBirth = raw.dateOfBirth ?? base.dateOfBirth;
  const computedAge = dateOfBirth ? ageFromDateOfBirth(dateOfBirth) : null;
  const age = computedAge ?? raw.age ?? base.age;
  const gender =
    raw.gender && (raw.gender as string) !== "Prefer not to say"
      ? (raw.gender as DatingProfile["gender"])
      : base.gender;
  const lookingFor =
    raw.lookingFor && (raw.lookingFor as string) !== "Everyone"
      ? (raw.lookingFor as DatingProfile["lookingFor"])
      : base.lookingFor;
  const onboardingComplete = Boolean(raw.onboardingComplete);
  const coverFromRaw =
    !onboardingComplete || !raw.coverPhotoExplicit
      ? undefined
      : raw.coverPhoto &&
          raw.photos?.some((p) => samePhotoRef(p, raw.coverPhoto))
        ? undefined
        : raw.coverPhoto;
  return {
    ...base,
    ...raw,
    state,
    city,
    dateOfBirth,
    age,
    gender: gender as DatingProfile["gender"],
    lookingFor: lookingFor as DatingProfile["lookingFor"],
    intents: normalizeIntents(raw.intents as string[] | undefined),
    interests: raw.interests ?? base.interests,
    coverPhoto: coverFromRaw,
    coverPhotoExplicit: onboardingComplete ? raw.coverPhotoExplicit : false,
    photos: sanitizeProfilePhotos(raw.photos ?? base.photos, coverFromRaw),
    verificationSelfie: raw.verificationSelfie,
    verificationStatus: raw.verificationStatus ?? "none",
    visibility: { ...base.visibility!, ...raw.visibility },
    matchingPrivacy: { ...base.matchingPrivacy!, ...raw.matchingPrivacy },
    safetySettings: { ...defaultSafetySettings(raw.gender ?? base.gender), ...raw.safetySettings },
    createdAt: raw.createdAt ?? base.createdAt ?? new Date().toISOString()
  };
}

function sanitizeProfilePhotos(photos: string[], coverPhoto?: string): string[] {
  const list = photos.filter(Boolean);
  if (!coverPhoto) return list;
  return list.filter((photo) => !samePhotoRef(photo, coverPhoto));
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
    kidsPreferences: raw.kidsPreferences ?? base.kidsPreferences,
    intents: raw.intents?.length ? normalizeIntents(raw.intents as string[]) : base.intents
  };
}
