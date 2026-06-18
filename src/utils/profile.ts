import { ageFromDateOfBirth, defaultAdultDob } from "./ageFromDob";
import { STORAGE_KEYS } from "../constants/limits";
import { MIN_PROFILE_PHOTOS } from "../constants/photos";
import { defaultSafetySettings } from "../constants/safety";
import { normalizeIntents } from "../constants/intents";
import { stateForCity, citiesForState, normalizeLifestyleTraits, resolveStateName } from "../constants/profileOptions";
import { normalizeSearchCities } from "./searchLocationPrefs";
import type { DatingProfile, MatchPreferences } from "../types";
import { normalizeCompliance } from "./compliance";
import { readJson } from "./storage";
import { samePhotoRef } from "./photoRefs";
import { isPersistablePhotoUrl, safeArray, safeCoverPhoto, safeNumber, safePhotos, safeProfile, safeString, safeUserCoverPhoto } from "./safeProfile";
import { prunePhotoMeta, safePhotoMeta } from "./photoMeta";
import { normalizeMainPhoto } from "./mainPhoto";

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
  statesOfOrigin: [],
  intents: [],
  occupations: [],
  genotypes: [],
  bodyTypes: [],
  relationshipIntentions: [],
  hasKids: [],
  wantsKids: [],
  verificationPreferences: [],
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
  const cleaned = safeProfile(raw);
  const city = safeString(cleaned.city) || base.city;
  const state = safeString(cleaned.state) || stateForCity(city) || base.state;
  const dateOfBirth =
    cleaned.dateOfBirth !== undefined
      ? safeString(cleaned.dateOfBirth) || undefined
      : cleaned.age !== undefined
        ? undefined
        : base.dateOfBirth;
  const computedAge = dateOfBirth ? ageFromDateOfBirth(dateOfBirth) : null;
  const age = safeNumber(cleaned.age, computedAge ?? base.age);
  const gender =
    cleaned.gender && (cleaned.gender as string) !== "Prefer not to say"
      ? (cleaned.gender as DatingProfile["gender"])
      : base.gender;
  const lookingFor =
    cleaned.lookingFor && (cleaned.lookingFor as string) !== "Everyone"
      ? (cleaned.lookingFor as DatingProfile["lookingFor"])
      : base.lookingFor;
  const onboardingComplete = Boolean(cleaned.onboardingComplete);
  const interestsTouched = Boolean(cleaned.interestsTouched);
  const rawInterests = safeArray<string>(cleaned.interests).map((item) => safeString(item)).filter(Boolean);
  const interests = onboardingComplete || interestsTouched ? rawInterests : [];
  const rawPhotosList = safePhotos(cleaned.photos ?? base.photos);
  const persistableCover = safeUserCoverPhoto(cleaned.coverPhoto);

  let coverPhoto: string | undefined;
  let coverPhotoExplicit = false;
  if (persistableCover && cleaned.coverPhotoExplicit !== false) {
    coverPhoto = persistableCover;
    coverPhotoExplicit = cleaned.coverPhotoExplicit ?? true;
  }

  const photosList = sanitizeProfilePhotos(rawPhotosList, coverPhoto);
  const photoMeta = prunePhotoMeta(safePhotoMeta(cleaned.photoMeta), photosList, coverPhoto);
  const { photos: orderedPhotos, mainPhotoUrl } = normalizeMainPhoto(
    photosList,
    safeString(cleaned.mainPhotoUrl) || undefined
  );
  const lifestyles = normalizeLifestyleTraits([
    ...safeArray<string>(cleaned.lifestyles),
    ...(cleaned.lifestyle && !isPreferNot(cleaned.lifestyle) ? [cleaned.lifestyle] : [])
  ]);
  const statesOfOrigin = safeArray<string>(cleaned.statesOfOrigin).slice(0, 1);
  const stateOfOrigin = safeString(cleaned.stateOfOrigin) || statesOfOrigin[0];
  const hasKidsOptions = safeArray<import("../types").HasKidsOption>(cleaned.hasKidsOptions).slice(0, 1);
  const wantsKidsOptions = safeArray<import("../types").WantsKidsOption>(cleaned.wantsKidsOptions).slice(0, 1);
  const bodyTypes = safeArray<import("../types").BodyType>(cleaned.bodyTypes).slice(0, 1);
  const genotypes = safeArray<import("../types").Genotype>(cleaned.genotypes).slice(0, 1);
  const genotype = safeString(cleaned.genotype) || genotypes[0] || undefined;
  const occupations = safeArray<import("../types").Occupation>(cleaned.occupations).slice(0, 1);
  const occupation = safeString(cleaned.occupation) || occupations[0] || undefined;

  return {
    ...base,
    ...cleaned,
    state,
    city,
    dateOfBirth,
    age,
    gender: gender as DatingProfile["gender"],
    lookingFor: lookingFor as DatingProfile["lookingFor"],
    bio: safeString(cleaned.bio),
    intents: normalizeIntents(safeArray<string>(cleaned.intents) as string[] | undefined),
    interests,
    interestsTouched: onboardingComplete ? interests.length > 0 || interestsTouched : interestsTouched,
    coverPhoto,
    coverPhotoExplicit,
    photos: orderedPhotos,
    mainPhotoUrl,
    photoMeta,
    verificationSelfie: isPersistablePhotoUrl(cleaned.verificationSelfie)
      ? cleaned.verificationSelfie
      : undefined,
    verificationStatus: cleaned.verificationStatus ?? "none",
    visibility: { ...base.visibility!, ...(cleaned.visibility ?? {}) },
    matchingPrivacy: { ...base.matchingPrivacy!, ...(cleaned.matchingPrivacy ?? {}) },
    safetySettings: { ...defaultSafetySettings(gender ?? base.gender), ...(cleaned.safetySettings ?? {}) },
    profilePrompts: safeArray(cleaned.profilePrompts),
    lifestyles,
    lifestyle: lifestyles[0],
    statesOfOrigin: stateOfOrigin ? [stateOfOrigin] : statesOfOrigin,
    stateOfOrigin: stateOfOrigin || undefined,
    genotype: genotype as import("../types").Genotype | undefined,
    genotypes: genotype ? [genotype as import("../types").Genotype] : genotypes,
    occupation: occupation as import("../types").Occupation | undefined,
    occupations: occupation ? [occupation as import("../types").Occupation] : occupations,
    hasKidsOptions,
    wantsKidsOptions,
    bodyTypes,
    createdAt: cleaned.createdAt ?? base.createdAt ?? new Date().toISOString(),
    compliance: normalizeCompliance(cleaned.compliance)
  };
}

function sanitizeProfilePhotos(photos: string[], coverPhoto?: string): string[] {
  const list = photos.filter(Boolean);
  if (!coverPhoto) return list;
  return list.filter((photo) => !samePhotoRef(photo, coverPhoto));
}

export function normalizeMatchPreferences(raw: Partial<MatchPreferences>): MatchPreferences {
  const base = defaultMatchPreferences();
  const legacyKids = raw.kidsPreferences ?? base.kidsPreferences ?? [];
  const hasKids =
    raw.hasKids ??
    legacyKids.filter((k): k is import("../types").HasKidsOption => k === "Has kids" || k === "No kids");
  const wantsKids =
    raw.wantsKids ??
    legacyKids.filter(
      (k): k is import("../types").WantsKidsOption =>
        k === "Wants kids" || k === "Doesn't want kids" || k === "Open to kids"
    );
  const verificationPreferences =
    raw.verificationPreferences ??
    (raw.requireVerified ? (["Selfie verified"] as import("../types").VerificationPreference[]) : []);

  const rawState = safeArray<string>(raw.states)[0];
  const normalizedState = rawState?.trim() ? resolveStateName(rawState) || rawState.trim() : undefined;

  return {
    ...base,
    ...raw,
    religions: safeArray(raw.religions),
    ethnicities: safeArray(raw.ethnicities),
    lifestyles: normalizeLifestyleTraits(raw.lifestyles),
    cities: normalizeSearchCities(raw.cities, normalizedState),
    states: normalizedState ? [normalizedState] : [],
    statesOfOrigin: safeArray<string>(raw.statesOfOrigin).slice(0, 1),
    occupations: safeArray<import("../types").Occupation>(raw.occupations).slice(0, 1),
    genotypes: safeArray<import("../types").Genotype>(raw.genotypes).slice(0, 1),
    bodyTypes: safeArray<import("../types").BodyType>(raw.bodyTypes).slice(0, 1),
    relationshipIntentions: safeArray(raw.relationshipIntentions),
    hasKids: hasKids.slice(0, 1),
    wantsKids: wantsKids.slice(0, 1),
    verificationPreferences,
    preferenceMode: raw.preferenceMode ?? base.preferenceMode,
    onlineNow: raw.onlineNow ?? false,
    minCompatibility: raw.minCompatibility,
    requireVoiceIntro: raw.requireVoiceIntro ?? false,
    requireVerified: raw.requireVerified ?? false,
    kidsPreferences: safeArray(raw.kidsPreferences),
    intents: raw.intents?.length ? normalizeIntents(raw.intents as string[]) : base.intents
  };
}
