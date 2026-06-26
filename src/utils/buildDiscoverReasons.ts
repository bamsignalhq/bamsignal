import type { DatingProfile, DiscoverProfile } from "../types";
import { buildCompatibilityReasons } from "./buildCompatibilityReasons";
import {
  isNewHereProfile,
  isOutstandingDiscoverProfile,
  isSameCityProfile,
  relationshipDiscoverScore
} from "./buildDiscoverRanking";
import { isTrustedMember } from "./trustedMember";
import { hasVoiceVibe } from "./voiceVibe";
import { safeString } from "./safeProfile";
import { isPreferNot } from "./profile";

export type DiscoverReason = {
  id: string;
  text: string;
};

export function buildDiscoverReasons(
  viewer: DatingProfile,
  profile: DiscoverProfile,
  limit = 2
): DiscoverReason[] {
  const reasons: DiscoverReason[] = [];
  const push = (id: string, text: string) => {
    if (reasons.some((item) => item.id === id)) return;
    reasons.push({ id, text });
  };

  if (isSameCityProfile(viewer, profile)) {
    push("same-city", "🌆 Same city");
  }

  if (isTrustedMember(profile)) {
    push("trusted", "🛡 Trusted Member");
  }

  const compatibility = buildCompatibilityReasons(viewer, profile);
  for (const line of compatibility) {
    if (reasons.length >= limit) break;
    if (/serious|marriage|relationship/i.test(line)) {
      push("relationship-goals", "💜 Similar relationship goals");
      break;
    }
    if (/faith/i.test(line)) {
      push("shared-values", "❤️ Shared values");
      break;
    }
  }

  const viewerReligion = safeString(viewer.religion).trim();
  const profileReligion = safeString(profile.religion).trim();
  if (
    viewerReligion &&
    profileReligion &&
    !isPreferNot(viewerReligion) &&
    viewerReligion === profileReligion &&
    !reasons.some((r) => r.id === "shared-values")
  ) {
    push("shared-values", "❤️ Shared values");
  }

  if (hasVoiceVibe(profile) && reasons.length < limit) {
    push("voice-vibe", "🎙 Voice Vibe available");
  }

  if (isNewHereProfile(profile) && reasons.length < limit) {
    push("new-here", "✨ New here");
  }

  if (isOutstandingDiscoverProfile(profile) && reasons.length < limit) {
    push("outstanding", "✨ Outstanding profile");
  }

  if (!reasons.length) {
    const score = relationshipDiscoverScore(viewer, profile);
    if (score > 0) {
      push("curated", "💜 Curated for you");
    }
  }

  return reasons.slice(0, limit);
}
