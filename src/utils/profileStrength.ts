import type { DatingProfile } from "../types";
import { normalizeEthnicities, normalizeOccupations } from "../constants/profileOptions";
import { safeArray, safeString } from "./safeProfile";
import { isPreferNot } from "./preferNot";
import { getVoiceVibeUrl } from "./voiceVibe";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import { normalizeMoreAboutMeInterests } from "./moreAboutMe";

export type ProfileStrengthTier = "getting-started" | "good" | "very-good" | "excellent" | "outstanding";

export type ProfileStrengthWeight = "high" | "medium" | "low";

export type ProfileStrengthLevel = {
  tier: ProfileStrengthTier;
  label: string;
  color: "gray" | "blue" | "purple" | "pink" | "gold";
  min: number;
  max: number;
};

export type ProfileStrengthFactorId =
  | "mainPhoto"
  | "extraPhotos"
  | "aboutMe"
  | "relationshipGoal"
  | "interests"
  | "occupation"
  | "education"
  | "lifestyle"
  | "trustedMember"
  | "voiceVibe"
  | "city"
  | "visibility";

export type ProfileStrengthImprovement = {
  id: ProfileStrengthFactorId;
  label: string;
  weight: ProfileStrengthWeight;
  done: boolean;
};

/** Reserved for future ranking signals — not used in scoring yet. */
export type ProfileStrengthFutureSignals = {
  boostInfluence?: number;
  responseRate?: number;
  matchQuality?: number;
  popularity?: number;
  activityScore?: number;
};

export type ProfileStrengthOptions = {
  phoneVerified?: boolean;
  isPremium?: boolean;
};

const LEVELS: ProfileStrengthLevel[] = [
  { tier: "getting-started", label: "Getting Started", color: "gray", min: 0, max: 30 },
  { tier: "good", label: "Good", color: "blue", min: 31, max: 60 },
  { tier: "very-good", label: "Very Good", color: "purple", min: 61, max: 80 },
  { tier: "excellent", label: "Excellent", color: "pink", min: 81, max: 95 },
  { tier: "outstanding", label: "Outstanding", color: "gold", min: 96, max: 100 }
];

const FACTOR_POINTS: Record<ProfileStrengthFactorId, number> = {
  mainPhoto: 12,
  extraPhotos: 18,
  voiceVibe: 15,
  trustedMember: 15,
  aboutMe: 10,
  interests: 8,
  relationshipGoal: 8,
  occupation: 6,
  lifestyle: 5,
  education: 5,
  city: 6,
  visibility: 6
};

const WEIGHT_BY_FACTOR: Record<ProfileStrengthFactorId, ProfileStrengthWeight> = {
  mainPhoto: "high",
  extraPhotos: "high",
  voiceVibe: "high",
  trustedMember: "high",
  aboutMe: "medium",
  interests: "medium",
  relationshipGoal: "medium",
  occupation: "medium",
  lifestyle: "low",
  education: "low",
  city: "low",
  visibility: "low"
};

const WEIGHT_RANK: Record<ProfileStrengthWeight, number> = {
  high: 3,
  medium: 2,
  low: 1
};

/** @deprecated legacy checklist shape */
export type ProfileCompletenessItem = {
  id: "photo" | "bio" | "interests" | "intent" | "verification" | "voice";
  label: string;
  done: boolean;
};

function photoCount(profile: DatingProfile): number {
  return safeArray<string>(profile.photos).filter(Boolean).length;
}

function hasMainPhoto(profile: DatingProfile): boolean {
  return photoCount(profile) > 0 || Boolean(safeString(profile.mainPhotoUrl).trim());
}

function extraPhotosProgress(profile: DatingProfile): number {
  const count = photoCount(profile);
  if (count >= 6) return 1;
  if (count <= 1) return 0;
  return (count - 1) / 5;
}

function hasAboutMe(profile: DatingProfile): boolean {
  const bio = safeString(profile.bio).trim();
  if (bio.length >= 12) return true;
  return safeArray<{ answer?: string }>(profile.profilePrompts).some(
    (row) => safeString(row.answer).trim().length >= 8
  );
}

function hasEducationSignal(profile: DatingProfile): boolean {
  const promptsAnswered = safeArray<{ answer?: string }>(profile.profilePrompts).filter(
    (row) => safeString(row.answer).trim().length >= 8
  );
  if (promptsAnswered.length >= 1) return true;
  const occupations = normalizeOccupations(profile.occupations, profile.occupation);
  return occupations.some((value) => /education|student|lecturer|teacher/i.test(value));
}

function hasOccupation(profile: DatingProfile): boolean {
  const occupations = normalizeOccupations(profile.occupations, profile.occupation);
  return occupations.some((value) => !isPreferNot(value));
}

function normalizeLifestyleTraits(profile: DatingProfile): string[] {
  const fromList = safeArray<string>(profile.lifestyles).filter((value) => !isPreferNot(value));
  if (fromList.length) return fromList;
  if (profile.lifestyle && !isPreferNot(profile.lifestyle)) return [profile.lifestyle];
  return [];
}

function hasLifestyle(profile: DatingProfile): boolean {
  return normalizeLifestyleTraits(profile).length > 0;
}

function hasTrustedMemberStatus(
  profile: DatingProfile,
  phoneVerified: boolean,
  isPremium: boolean
): boolean {
  const accountAgeDays = profile.createdAt
    ? Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / 86400000)
    : 0;
  const cleanRecord = (profile.reportCount ?? 0) === 0;
  const selfieApproved = Boolean(profile.verified);

  // Mirror verification tier thresholds without calling getVerificationTier — it
  // uses calculateProfileStrength, which includes this trustedMember factor.
  if (isPremium && cleanRecord) return true;
  if (phoneVerified && selfieApproved && accountAgeDays >= 7 && cleanRecord) return true;
  return selfieApproved && phoneVerified && cleanRecord;
}

function hasVisibilityReady(profile: DatingProfile): boolean {
  if (!safeString(profile.city).trim()) return false;
  const visibility = profile.visibility;
  const privacy = profile.matchingPrivacy;
  if (!visibility && !privacy) return true;
  return (
    visibility?.showReligion !== false ||
    visibility?.showEthnicity !== false ||
    visibility?.showState !== false ||
    privacy?.useReligionForMatching !== false ||
    privacy?.useEthnicityForMatching !== false ||
    privacy?.useStateForMatching !== false
  );
}

function factorCompletion(
  profile: DatingProfile,
  id: ProfileStrengthFactorId,
  options: ProfileStrengthOptions
): boolean | number {
  const phoneVerified = Boolean(options.phoneVerified);
  const isPremium = Boolean(options.isPremium);

  switch (id) {
    case "mainPhoto":
      return hasMainPhoto(profile);
    case "extraPhotos":
      return extraPhotosProgress(profile);
    case "aboutMe":
      return hasAboutMe(profile);
    case "relationshipGoal":
      return relationshipIntentsFrom(profile.intents).length >= 1;
    case "interests":
      return normalizeMoreAboutMeInterests(profile.interests).length >= 1;
    case "occupation":
      return hasOccupation(profile);
    case "education":
      return hasEducationSignal(profile);
    case "lifestyle":
      return hasLifestyle(profile);
    case "trustedMember":
      return hasTrustedMemberStatus(profile, phoneVerified, isPremium);
    case "voiceVibe":
      return Boolean(getVoiceVibeUrl(profile));
    case "city":
      return Boolean(safeString(profile.city).trim());
    case "visibility":
      return hasVisibilityReady(profile);
    default:
      return false;
  }
}

function factorScore(profile: DatingProfile, id: ProfileStrengthFactorId, options: ProfileStrengthOptions): number {
  const max = FACTOR_POINTS[id];
  const completion = factorCompletion(profile, id, options);
  if (typeof completion === "number") return Math.round(max * completion);
  return completion ? max : 0;
}

export function getProfileStrengthLevel(score: number): ProfileStrengthLevel {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return (
    LEVELS.find((level) => clamped >= level.min && clamped <= level.max) ??
    LEVELS[0]
  );
}

/** 0–100 weighted profile strength — used for ranking; UI should prefer level labels. */
export function calculateProfileStrength(
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): number {
  const raw = (Object.keys(FACTOR_POINTS) as ProfileStrengthFactorId[]).reduce(
    (sum, id) => sum + factorScore(profile, id, options),
    0
  );
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function improvementLabel(profile: DatingProfile, id: ProfileStrengthFactorId): string {
  switch (id) {
    case "mainPhoto":
      return "Add a main photo";
    case "extraPhotos": {
      const count = photoCount(profile);
      const need = Math.max(0, 4 - count);
      if (need <= 0) return "Add more photos";
      return need === 1 ? "Add 1 more photo" : `Add ${need} more photos`;
    }
    case "aboutMe":
      return "Tell people about yourself";
    case "relationshipGoal":
      return "Tell people what brings you here";
    case "interests":
      return "Tell people more about yourself";
    case "occupation":
      return "Add your occupation";
    case "education":
      return "Share a little more about your background";
    case "lifestyle":
      return "Add your lifestyle";
    case "trustedMember":
      return "Become a Trusted Member";
    case "voiceVibe":
      return "Add Voice Vibe";
    case "city":
      return "Add your city";
    case "visibility":
      return "Review profile visibility settings";
    default:
      return "Improve your profile";
  }
}

export function getProfileStrengthImprovements(
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): ProfileStrengthImprovement[] {
  return (Object.keys(FACTOR_POINTS) as ProfileStrengthFactorId[])
    .map((id) => {
      const completion = factorCompletion(profile, id, options);
      const done = completion === true || completion === 1;
      return {
        id,
        label: improvementLabel(profile, id),
        weight: WEIGHT_BY_FACTOR[id],
        done
      };
    })
    .filter((item) => !item.done)
    .sort((a, b) => WEIGHT_RANK[b.weight] - WEIGHT_RANK[a.weight]);
}

export function getProfileStrengthSubtext(level: ProfileStrengthLevel): string {
  if (level.tier === "outstanding") {
    return "Your profile is among the strongest on BamSignal.";
  }
  if (level.tier === "getting-started") {
    return "Let's build your profile together.";
  }
  return "Complete profiles receive more replies and better visibility.";
}

export function profileStrengthHint(strength: number): string {
  const level = getProfileStrengthLevel(strength);
  return getProfileStrengthSubtext(level);
}

export function getProfileStrengthSuggestions(profile: DatingProfile): string[] {
  return getProfileStrengthImprovements(profile)
    .map((item) => item.label)
    .slice(0, 3);
}

/** @deprecated legacy checklist — mapped from weighted factors */
export function getProfileCompletenessChecklist(profile: DatingProfile): ProfileCompletenessItem[] {
  const improvements = getProfileStrengthImprovements(profile);
  const mapLegacy = (id: ProfileCompletenessItem["id"], label: string, done: boolean): ProfileCompletenessItem => ({
    id,
    label,
    done
  });

  return [
    mapLegacy("photo", "Photo", !improvements.some((item) => item.id === "mainPhoto")),
    mapLegacy("bio", "Bio", !improvements.some((item) => item.id === "aboutMe")),
    mapLegacy("interests", "More About Me", !improvements.some((item) => item.id === "interests")),
    mapLegacy("intent", "Intent", !improvements.some((item) => item.id === "relationshipGoal")),
    mapLegacy("verification", "Verification", !improvements.some((item) => item.id === "trustedMember")),
    mapLegacy("voice", "Voice Vibe", !improvements.some((item) => item.id === "voiceVibe"))
  ];
}

export function profileCompletenessCount(profile: DatingProfile): { done: number; total: number } {
  const checklist = getProfileCompletenessChecklist(profile);
  return {
    done: checklist.filter((item) => item.done).length,
    total: checklist.length
  };
}

/** Legacy breakdown for any remaining consumers */
export type ProfileStrengthBreakdown = {
  photo: boolean;
  bio: boolean;
  city: boolean;
  interests: boolean;
  intent: boolean;
  lifestyle: boolean;
  religion: boolean;
  ethnicity: boolean;
  verification: boolean;
};

export function getProfileStrengthBreakdown(profile: DatingProfile): ProfileStrengthBreakdown {
  return {
    photo: hasMainPhoto(profile),
    bio: hasAboutMe(profile),
    city: Boolean(profile.city?.trim()),
    interests: normalizeMoreAboutMeInterests(profile.interests).length >= 1,
    intent: (profile.intents?.length ?? 0) >= 1,
    lifestyle: hasLifestyle(profile),
    religion: Boolean(profile.religion && !isPreferNot(profile.religion)),
    ethnicity: Boolean(
      normalizeEthnicities(profile.ethnicities, profile.ethnicity).length > 0
    ),
    verification: profile.verified
  };
}
