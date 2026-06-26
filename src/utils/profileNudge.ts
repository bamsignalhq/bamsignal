import type { DatingProfile } from "../types";
import { normalizeOccupations } from "../constants/profileOptions";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import { normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { isPreferNot } from "./preferNot";
import {
  calculateProfileStrength,
  getProfileStrengthLevel,
  type ProfileStrengthFactorId,
  type ProfileStrengthOptions
} from "./profileStrength";
import { safeArray, safeString } from "./safeProfile";
import { isTrustedMember } from "./trustedMember";
import { getVoiceVibeUrl } from "./voiceVibe";

export type ProfileNudgeKind = "fields" | "photos" | "verification" | "biography" | "interests";

export type ProfileImprovementNudgeContent = {
  kind: ProfileNudgeKind;
  emoji: string;
  lead: string;
  cta: string;
  editSection?: "photos" | "bio" | "interests" | "intent";
};

const NUDGE_DISMISS_PREFIX = "bamsignal_profile_nudge_dismiss_";
const NUDGE_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

const FIELD_FACTORS: ProfileStrengthFactorId[] = [
  "relationshipGoal",
  "occupation",
  "education",
  "lifestyle",
  "city",
  "voiceVibe",
  "visibility"
];

function photoCount(profile: DatingProfile): number {
  return safeArray<string>(profile.photos).filter(Boolean).length;
}

function hasMainPhoto(profile: DatingProfile): boolean {
  return photoCount(profile) > 0 || Boolean(safeString(profile.mainPhotoUrl).trim());
}

function hasExtraPhotos(profile: DatingProfile): boolean {
  return photoCount(profile) >= 4;
}

function hasAboutMe(profile: DatingProfile): boolean {
  const bio = safeString(profile.bio).trim();
  if (bio.length >= 12) return true;
  return safeArray<{ answer?: string }>(profile.profilePrompts).some(
    (row) => safeString(row.answer).trim().length >= 8
  );
}

function hasInterests(profile: DatingProfile): boolean {
  return normalizeMoreAboutMeInterests(profile.interests).length >= 1;
}

function hasProfileFields(profile: DatingProfile, options: ProfileStrengthOptions): boolean {
  return FIELD_FACTORS.every((id) => isFieldComplete(profile, id, options));
}

function isFieldComplete(
  profile: DatingProfile,
  id: ProfileStrengthFactorId,
  options: ProfileStrengthOptions
): boolean {
  switch (id) {
    case "relationshipGoal":
      return relationshipIntentsFrom(profile.intents).length >= 1;
    case "occupation": {
      const occupations = normalizeOccupations(profile.occupations, profile.occupation);
      return occupations.some((value) => !isPreferNot(value));
    }
    case "education": {
      const promptsAnswered = safeArray<{ answer?: string }>(profile.profilePrompts).filter(
        (row) => safeString(row.answer).trim().length >= 8
      );
      if (promptsAnswered.length >= 1) return true;
      const occupations = normalizeOccupations(profile.occupations, profile.occupation);
      return occupations.some((value) => /education|student|lecturer|teacher/i.test(value));
    }
    case "lifestyle": {
      const fromList = safeArray<string>(profile.lifestyles).filter((value) => !isPreferNot(value));
      if (fromList.length) return true;
      return Boolean(profile.lifestyle && !isPreferNot(profile.lifestyle));
    }
    case "city":
      return Boolean(safeString(profile.city).trim());
    case "voiceVibe":
      return Boolean(getVoiceVibeUrl(profile));
    case "visibility": {
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
    default:
      return true;
  }
}

export function profileNudgeFingerprint(
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): string {
  return String(calculateProfileStrength(profile, options));
}

function readDismissRecord(kind: ProfileNudgeKind): { at: number; fingerprint: string } | null {
  try {
    const raw = localStorage.getItem(`${NUDGE_DISMISS_PREFIX}${kind}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: number; fingerprint?: string };
    if (!parsed?.at || !parsed.fingerprint) return null;
    return { at: parsed.at, fingerprint: parsed.fingerprint };
  } catch {
    return null;
  }
}

export function shouldShowProfileNudge(
  kind: ProfileNudgeKind,
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): boolean {
  const record = readDismissRecord(kind);
  if (!record) return true;
  const fingerprint = profileNudgeFingerprint(profile, options);
  if (fingerprint !== record.fingerprint) return true;
  return Date.now() - record.at >= NUDGE_DISMISS_MS;
}

export function dismissProfileNudge(
  kind: ProfileNudgeKind,
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): void {
  try {
    localStorage.setItem(
      `${NUDGE_DISMISS_PREFIX}${kind}`,
      JSON.stringify({
        at: Date.now(),
        fingerprint: profileNudgeFingerprint(profile, options)
      })
    );
  } catch {
    // ignore storage failures
  }
}

export function resolveProfileImprovementNudge(
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): ProfileImprovementNudgeContent | null {
  const score = calculateProfileStrength(profile, options);
  const level = getProfileStrengthLevel(score);
  if (level.tier === "outstanding") return null;

  if (!hasProfileFields(profile, options)) {
    return {
      kind: "fields",
      emoji: "✨",
      lead: `Profile ${score}% complete`,
      cta: "Complete profile →"
    };
  }

  if (!hasMainPhoto(profile) || !hasExtraPhotos(profile)) {
    const count = photoCount(profile);
    const need = Math.max(0, 4 - count);
    return {
      kind: "photos",
      emoji: "📷",
      lead: need <= 0 ? "Add more photos" : need === 1 ? "Add 1 more photo" : `Add ${need} more photos`,
      cta: "Improve visibility →",
      editSection: "photos"
    };
  }

  if (!isTrustedMember(profile) && !profile.verified) {
    return {
      kind: "verification",
      emoji: "🛡",
      lead: "Verify your identity",
      cta: "Increase confidence →"
    };
  }

  if (!hasAboutMe(profile)) {
    return {
      kind: "biography",
      emoji: "✏️",
      lead: "Add a short bio",
      cta: "Complete profile →",
      editSection: "bio"
    };
  }

  if (!hasInterests(profile)) {
    return {
      kind: "interests",
      emoji: "✨",
      lead: "Share your interests",
      cta: "Complete profile →",
      editSection: "interests"
    };
  }

  return null;
}

export function resolveVisibleProfileImprovementNudge(
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): ProfileImprovementNudgeContent | null {
  const nudge = resolveProfileImprovementNudge(profile, options);
  if (!nudge) return null;
  if (!shouldShowProfileNudge(nudge.kind, profile, options)) return null;
  return nudge;
}
