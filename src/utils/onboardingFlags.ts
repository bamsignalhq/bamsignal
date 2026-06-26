import type { DatingProfile } from "../types";
import { safeString } from "./safeProfile";

export type OnboardingStatusSnapshot = {
  markedComplete: boolean;
  onboardingComplete: boolean;
  setupCompleted: boolean;
  profileCompletedAt?: string;
  onboardingCompletedAt?: string;
  completedAt?: string;
};

/** Normalize completion flags across camelCase and snake_case variants. */
export function normalizeOnboardingStatus(
  raw: Partial<DatingProfile> | Record<string, unknown> | null | undefined
): OnboardingStatusSnapshot {
  const profile = (raw ?? {}) as Record<string, unknown>;
  const onboardingComplete = Boolean(
    profile.onboardingComplete ?? profile.onboardingCompleted ?? profile.onboarding_completed
  );
  const setupCompleted = Boolean(profile.setupCompleted ?? profile.setup_completed);
  const profileCompletedAt =
    safeString(profile.profileCompletedAt ?? profile.profile_completed_at) || undefined;
  const onboardingCompletedAt =
    safeString(profile.onboardingCompletedAt ?? profile.onboarding_completed_at) || undefined;
  const completedAt = safeString(profile.completedAt ?? profile.completed_at) || undefined;
  const markedComplete = Boolean(
    onboardingComplete || setupCompleted || profileCompletedAt || onboardingCompletedAt || completedAt
  );

  return {
    markedComplete,
    onboardingComplete: markedComplete || onboardingComplete,
    setupCompleted: markedComplete || setupCompleted,
    profileCompletedAt,
    onboardingCompletedAt,
    completedAt
  };
}

export function isProfileOnboardingMarkedComplete(profile: Partial<DatingProfile>): boolean {
  return normalizeOnboardingStatus(profile).markedComplete;
}

export function mergeOnboardingCompleteFlag(
  local: Partial<DatingProfile>,
  remote: Partial<DatingProfile>
): boolean {
  return (
    normalizeOnboardingStatus(remote).markedComplete || normalizeOnboardingStatus(local).markedComplete
  );
}
