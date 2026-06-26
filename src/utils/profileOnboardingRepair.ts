import type { DatingProfile, UserProfile } from "../types";
import { hasRequiredProfileBasics } from "./buildProfileLater";
import { clearOnboardingDrafts } from "./onboardingDrafts";
import {
  isProfileOnboardingMarkedComplete,
  normalizeOnboardingStatus,
  type OnboardingStatusSnapshot
} from "./onboardingFlags";
import { normalizeDatingProfile } from "./profile";
import { isPersistablePhotoUrl, safePhotos } from "./safeProfile";

export type { OnboardingStatusSnapshot };

function profileQualifiesForLegacyRepair(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): boolean {
  if (isProfileOnboardingMarkedComplete(profile)) return false;
  return hasRequiredProfileBasics(profile, user);
}

export function repairCompletedProfile(
  profile: Partial<DatingProfile>,
  user?: Pick<UserProfile, "name">
): {
  profile: DatingProfile;
  repaired: boolean;
} {
  const normalized = normalizeDatingProfile(profile);
  if (!profileQualifiesForLegacyRepair(normalized, user)) {
    return { profile: normalized, repaired: false };
  }

  clearOnboardingDrafts();
  const now = new Date().toISOString();
  const status = normalizeOnboardingStatus(normalized);
  return {
    profile: normalizeDatingProfile({
      ...normalized,
      onboardingComplete: true,
      setupCompleted: true,
      onboardingCompletedAt: status.onboardingCompletedAt || now,
      profileCompletedAt: status.profileCompletedAt || now,
      completedAt: status.completedAt || now
    }),
    repaired: true
  };
}

export function logRouteDecision(
  user: Pick<UserProfile, "email" | "phone" | "name">,
  profile: Partial<DatingProfile>,
  route: "home" | "onboarding",
  extra?: Record<string, unknown>
): void {
  if (!import.meta.env.DEV) return;
  const normalized = normalizeDatingProfile(profile);
  const status = normalizeOnboardingStatus(normalized);
  const userId = user.email || user.phone || "unknown";
  const photos = safePhotos(normalized.photos).filter(isPersistablePhotoUrl);
  console.info("[route-decision] userId", userId);
  console.info("[route-decision] profile exists", Boolean(profile && Object.keys(profile).length));
  console.info("[route-decision] onboardingCompleted", status.onboardingComplete);
  console.info("[route-decision] setupCompleted", status.setupCompleted);
  console.info("[route-decision] profileCompletedAt", status.profileCompletedAt ?? null);
  console.info("[route-decision] photos count", photos.length);
  console.info("[route-decision] final route", route);
  if (extra && Object.keys(extra).length) {
    console.info("[route-decision] context", extra);
  }
}

export { isProfileOnboardingMarkedComplete };
