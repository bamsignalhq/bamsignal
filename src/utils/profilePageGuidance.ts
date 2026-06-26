import type { DatingProfile } from "../types";
import { MAX_PROFILE_PHOTOS } from "../constants/photos";
import { isTrustedMember, isTrustedMemberPending } from "./trustedMember";
import { dismissProfileNudge, shouldShowProfileNudge } from "./profileNudge";
import type { ProfileStrengthOptions } from "./profileStrength";
import { safeArray } from "./safeProfile";
import { getVoiceVibeUrl } from "./voiceVibe";

export type ProfilePageGuidanceKind = "photos" | "voice" | "trusted";

export type ProfilePageGuidance = {
  kind: ProfilePageGuidanceKind;
  emoji: string;
  lead: string;
  cta: string;
};

const GUIDANCE_DISMISS_PREFIX = "bamsignal_profile_guidance_dismiss_";
const GUIDANCE_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

function photoCount(profile: DatingProfile): number {
  return safeArray<string>(profile.photos).filter(Boolean).length;
}

function readGuidanceDismiss(kind: ProfilePageGuidanceKind): number | null {
  try {
    const raw = localStorage.getItem(`${GUIDANCE_DISMISS_PREFIX}${kind}`);
    if (!raw) return null;
    const dismissedAt = Number(raw);
    return Number.isFinite(dismissedAt) ? dismissedAt : null;
  } catch {
    return null;
  }
}

export function shouldShowProfilePageGuidance(kind: ProfilePageGuidanceKind): boolean {
  const dismissedAt = readGuidanceDismiss(kind);
  if (!dismissedAt) return true;
  return Date.now() - dismissedAt >= GUIDANCE_DISMISS_MS;
}

export function dismissProfilePageGuidance(kind: ProfilePageGuidanceKind): void {
  try {
    localStorage.setItem(`${GUIDANCE_DISMISS_PREFIX}${kind}`, String(Date.now()));
  } catch {
    // ignore storage failures
  }
}

export function resolveProfilePageGuidance(
  profile: DatingProfile,
  options: ProfileStrengthOptions = {}
): ProfilePageGuidance | null {
  const count = photoCount(profile);
  const photoTarget = Math.min(6, MAX_PROFILE_PHOTOS);

  if (count < photoTarget) {
    const need = Math.max(1, Math.min(4, photoTarget) - count);
    if (shouldShowProfileNudge("photos", profile, options) && shouldShowProfilePageGuidance("photos")) {
      return {
        kind: "photos",
        emoji: "✨",
        lead: need === 1 ? "Add one more photo" : `Add ${need} more photos`,
        cta: "→"
      };
    }
  }

  if (
    !isTrustedMember(profile) &&
    !isTrustedMemberPending(profile) &&
    shouldShowProfileNudge("verification", profile, options) &&
    shouldShowProfilePageGuidance("trusted")
  ) {
    return {
      kind: "trusted",
      emoji: "🛡",
      lead: "Build trust",
      cta: "Become Trusted →"
    };
  }

  return null;
}

export { dismissProfileNudge };
