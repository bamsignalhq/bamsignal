import type { DatingProfile, DiscoverProfile } from "../types";
import { relationshipIntentsFrom } from "../constants/relationshipIntent";
import { normalizeMoreAboutMeInterests } from "./moreAboutMe";
import { calculateProfileStrength, getProfileStrengthLevel } from "./profileStrength";
import { isRecentlyActive } from "./launchSeed";
import { isTrustedMember } from "./trustedMember";
import { hasVoiceVibe } from "./voiceVibe";
import { safeArray, safeString } from "./safeProfile";
import { isPreferNot } from "./profile";
import { normalizeLifestyleTraits } from "../constants/profileOptions";

const RELATIONSHIP_FOCUSED = new Set(["SeriousRelationship", "Marriage", "Companionship"]);

function normalizeCity(value = ""): string {
  return String(value).trim().toLowerCase();
}

function sharedRelationshipGoals(viewer: DatingProfile, profile: DiscoverProfile): number {
  const viewerIntents = new Set(relationshipIntentsFrom(viewer.intents));
  const profileIntents = relationshipIntentsFrom(profile.intents);
  return profileIntents.filter((intent) => viewerIntents.has(intent)).length;
}

function sharedInterests(viewer: DatingProfile, profile: DiscoverProfile): number {
  const viewerItems = new Set(normalizeMoreAboutMeInterests(viewer.interests));
  return normalizeMoreAboutMeInterests(profile.interests).filter((item) => viewerItems.has(item)).length;
}

function sharedValues(viewer: DatingProfile, profile: DiscoverProfile): number {
  let score = 0;
  const viewerReligion = safeString(viewer.religion).trim();
  const profileReligion = safeString(profile.religion).trim();
  if (viewerReligion && profileReligion && !isPreferNot(viewerReligion) && viewerReligion === profileReligion) {
    score += 2;
  }
  const viewerLifestyle = new Set(normalizeLifestyleTraits(viewer.lifestyles ?? (viewer.lifestyle ? [viewer.lifestyle] : [])));
  const profileLifestyle = normalizeLifestyleTraits(profile.lifestyles ?? (profile.lifestyle ? [profile.lifestyle] : []));
  if (viewerLifestyle.has("Faith centered") && profileLifestyle.includes("Faith centered")) score += 2;
  return score;
}

export function relationshipDiscoverScore(viewer: DatingProfile, profile: DiscoverProfile): number {
  let score = 0;

  if (normalizeCity(viewer.city) && normalizeCity(viewer.city) === normalizeCity(profile.city)) {
    score += 1000;
  }

  if (isTrustedMember(profile)) score += 500;

  score += sharedRelationshipGoals(viewer, profile) * 120;
  score += sharedValues(viewer, profile) * 90;
  score += sharedInterests(viewer, profile) * 70;

  if (hasVoiceVibe(profile)) score += 80;

  const strength = calculateProfileStrength(profile as DatingProfile);
  score += strength * 0.6;

  if (isRecentlyActive(profile)) score += 40;

  return score;
}

export function rankDiscoverProfiles(
  profiles: DiscoverProfile[],
  viewer: DatingProfile
): DiscoverProfile[] {
  return [...profiles].sort(
    (a, b) => relationshipDiscoverScore(viewer, b) - relationshipDiscoverScore(viewer, a)
  );
}

export function isRelationshipFocusedProfile(profile: DiscoverProfile): boolean {
  return relationshipIntentsFrom(profile.intents).some((intent) => RELATIONSHIP_FOCUSED.has(intent));
}

export function isOutstandingDiscoverProfile(profile: DiscoverProfile): boolean {
  const level = getProfileStrengthLevel(calculateProfileStrength(profile as DatingProfile));
  return level.tier === "outstanding";
}

export function isNewHereProfile(profile: DiscoverProfile): boolean {
  if (!profile.createdAt) return false;
  return Date.now() - new Date(profile.createdAt).getTime() < 7 * 86400000;
}

export function isSameCityProfile(viewer: DatingProfile, profile: DiscoverProfile): boolean {
  return Boolean(
    viewer.city && profile.city && normalizeCity(viewer.city) === normalizeCity(profile.city)
  );
}
