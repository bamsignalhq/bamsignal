import { ageFromDateOfBirth, defaultAdultDob } from "./ageFromDob";
import { STORAGE_KEYS } from "../constants/limits";
import { defaultSafetySettings } from "../constants/safety";
import { normalizeIntents } from "../constants/intents";
import {
  stateForCity,
  citiesForState,
  normalizeEthnicities,
  normalizeFaith,
  normalizeFaithList,
  normalizeLifestyleTraits,
  normalizeOccupations,
  normalizeStatesOfOrigin,
  normalizeGenotypes,
  normalizeHasKidsOptions,
  normalizeWantsKidsOptions,
  normalizeBodyTypes,
  normalizeRelationshipIntentions,
  resolveStateName
} from "../constants/profileOptions";
import { sanitizeIntentsForActivePass } from "./quickieIntents";
import { normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { normalizeSearchCities } from "./searchLocationPrefs";
import type { DatingProfile, MatchPreferences } from "../types";
import { normalizeCoverFields } from "./coverPhoto";
import { normalizeCompliance } from "./compliance";
import {
  resolveLookingFor
} from "./interestedInDefaults";
import { readJson } from "./storage";
import { samePhotoRef } from "./photoRefs";
import { isPersistablePhotoUrl, isPersistableVoiceIntroUrl, safeArray, safeCoverPhoto, safeNumber, safePhotos, safeProfile, safeString, safeUserCoverPhoto } from "./safeProfile";
import { prunePhotoMeta, safePhotoMeta } from "./photoMeta";
import { normalizeMainPhoto } from "./mainPhoto";
import { isPreferNot } from "./preferNot";
import { isOnboardingFullyComplete } from "./onboardingStatus";
import { normalizeOnboardingStatus } from "./onboardingFlags";

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
  intents: ["SeriousRelationship"],
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
  moreAboutMe: [],
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

export function isOnboardingComplete(user?: Pick<import("../types").UserProfile, "name">): boolean {
  const profile = getDatingProfile();
  const resolvedUser =
    user ??
    readJson<import("../types").UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  return isOnboardingFullyComplete(profile, resolvedUser);
}

export function profileNeedsOnboarding(
  profile: Partial<DatingProfile> = getDatingProfile(),
  user?: Pick<import("../types").UserProfile, "name">
): boolean {
  const resolvedUser =
    user ??
    readJson<import("../types").UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  return !isOnboardingFullyComplete(profile, resolvedUser);
}

export { isPreferNot } from "./preferNot";

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
  const onboardingStatus = normalizeOnboardingStatus(cleaned as Record<string, unknown>);
  const onboardingComplete = onboardingStatus.markedComplete;
  const interestedInManuallyChanged = Boolean(cleaned.interestedInManuallyChanged);
  const lookingFor = resolveLookingFor({
    raw: cleaned.lookingFor,
    gender: gender as DatingProfile["gender"],
    interestedInManuallyChanged,
    onboardingComplete,
    fallback: base.lookingFor
  });
  const interestsTouched = Boolean(cleaned.interestsTouched);
  const rawInterests = safeArray<string>(cleaned.interests).map((item) => safeString(item)).filter(Boolean);
  const interests = onboardingComplete || interestsTouched ? normalizeMoreAboutMeInterests(rawInterests) : [];
  const rawPhotosList = safePhotos(cleaned.photos ?? base.photos);
  const coverFields = normalizeCoverFields(cleaned);
  const persistableCover = coverFields.coverPhotoUrl;

  let coverPhoto: string | undefined;
  let coverPhotoUrl: string | undefined;
  let coverPhotoPath: string | undefined;
  let coverPhotoUpdatedAt: string | undefined;
  let coverPhotoExplicit = false;
  if (persistableCover && cleaned.coverPhotoExplicit !== false) {
    coverPhoto = persistableCover;
    coverPhotoUrl = persistableCover;
    coverPhotoPath = coverFields.coverPhotoPath;
    coverPhotoUpdatedAt = coverFields.coverPhotoUpdatedAt;
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
  const statesOfOrigin = normalizeStatesOfOrigin(cleaned.statesOfOrigin, cleaned.stateOfOrigin);
  const stateOfOrigin = statesOfOrigin[0];
  const hasKidsOptions = normalizeHasKidsOptions(cleaned.hasKidsOptions);
  const wantsKidsOptions = normalizeWantsKidsOptions(cleaned.wantsKidsOptions);
  const bodyTypes = normalizeBodyTypes(cleaned.bodyTypes);
  const genotypes = normalizeGenotypes(cleaned.genotypes, cleaned.genotype);
  const genotype = genotypes[0];
  const occupations = normalizeOccupations(cleaned.occupations, cleaned.occupation);
  const occupation = occupations[0];
  const ethnicities = normalizeEthnicities(cleaned.ethnicities, cleaned.ethnicity);
  const religion = normalizeFaith(cleaned.religion ?? (cleaned as { religions?: unknown }).religions);

  return {
    ...base,
    ...cleaned,
    state,
    city,
    dateOfBirth,
    age,
    gender: gender as DatingProfile["gender"],
    lookingFor,
    interestedInManuallyChanged,
    bio: safeString(cleaned.bio),
    intents: sanitizeIntentsForActivePass(
      normalizeIntents(safeArray<string>(cleaned.intents) as string[] | undefined)
    ),
    fastConnectionInterested: Boolean(cleaned.fastConnectionInterested),
    interests,
    interestsTouched: onboardingComplete ? interests.length > 0 || interestsTouched : interestsTouched,
    coverPhoto,
    coverPhotoUrl,
    coverPhotoPath,
    coverPhotoUpdatedAt,
    coverPhotoExplicit,
    photos: orderedPhotos,
    mainPhotoUrl,
    photoMeta,
    verificationSelfie: isPersistablePhotoUrl(cleaned.verificationSelfie)
      ? cleaned.verificationSelfie
      : undefined,
    voiceIntroUrl: isPersistableVoiceIntroUrl(cleaned.voiceIntroUrl)
      ? safeString(cleaned.voiceIntroUrl)
      : undefined,
    voiceIntroDuration: safeNumber(cleaned.voiceIntroDuration, 0) || undefined,
    voiceIntroUpdatedAt: safeString(cleaned.voiceIntroUpdatedAt) || undefined,
    voiceVibeUrl: isPersistableVoiceIntroUrl(cleaned.voiceVibeUrl)
      ? safeString(cleaned.voiceVibeUrl)
      : isPersistableVoiceIntroUrl(cleaned.voiceIntroUrl)
        ? safeString(cleaned.voiceIntroUrl)
        : undefined,
    voiceVibeDuration: safeNumber(cleaned.voiceVibeDuration ?? cleaned.voiceIntroDuration, 0) || undefined,
    voiceVibeTranscript: safeString(cleaned.voiceVibeTranscript) || undefined,
    voiceVibeCreatedAt:
      safeString(cleaned.voiceVibeCreatedAt) || safeString(cleaned.voiceIntroUpdatedAt) || undefined,
    verificationStatus: cleaned.verificationStatus ?? "none",
    visibility: { ...base.visibility!, ...(cleaned.visibility ?? {}) },
    matchingPrivacy: { ...base.matchingPrivacy!, ...(cleaned.matchingPrivacy ?? {}) },
    safetySettings: { ...defaultSafetySettings(gender ?? base.gender), ...(cleaned.safetySettings ?? {}) },
    profilePrompts: safeArray(cleaned.profilePrompts),
    lifestyles,
    lifestyle: lifestyles[0],
    statesOfOrigin,
    stateOfOrigin: stateOfOrigin || undefined,
    genotype: genotype as import("../types").Genotype | undefined,
    genotypes,
    occupation: occupation as import("../types").Occupation | undefined,
    occupations,
    hasKidsOptions,
    wantsKidsOptions,
    bodyTypes,
    religion,
    ethnicities,
    ethnicity: ethnicities[0],
    onboardingComplete: onboardingStatus.onboardingComplete,
    setupCompleted: onboardingStatus.setupCompleted || Boolean(cleaned.setupCompleted),
    onboardingCompletedAt:
      onboardingStatus.onboardingCompletedAt ||
      safeString(cleaned.onboardingCompletedAt) ||
      undefined,
    profileCompletedAt:
      onboardingStatus.profileCompletedAt ||
      safeString(cleaned.profileCompletedAt) ||
      undefined,
    completedAt:
      onboardingStatus.completedAt || safeString(cleaned.completedAt) || undefined,
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
    religions: normalizeFaithList(raw.religions),
    ethnicities: normalizeEthnicities(raw.ethnicities),
    lifestyles: normalizeLifestyleTraits(raw.lifestyles),
    cities: normalizeSearchCities(raw.cities, normalizedState),
    states: normalizedState ? [normalizedState] : [],
    statesOfOrigin: normalizeStatesOfOrigin(raw.statesOfOrigin),
    occupations: normalizeOccupations(raw.occupations),
    genotypes: normalizeGenotypes(raw.genotypes),
    bodyTypes: normalizeBodyTypes(raw.bodyTypes),
    relationshipIntentions: normalizeRelationshipIntentions(raw.relationshipIntentions),
    moreAboutMe: normalizeMoreAboutMeInterests(raw.moreAboutMe),
    hasKids: normalizeHasKidsOptions(hasKids),
    wantsKids: normalizeWantsKidsOptions(wantsKids),
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
