import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { normalizeDatingProfile } from "../utils/profile";
import {
  clearOnboardingDrafts,
  normalizeOnboardingStatus,
  type OnboardingStatusSnapshot
} from "../utils/onboardingStatus";
import { readJson, writeJson } from "../utils/storage";
import { apiUrl } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";

type MemberIdentity = Pick<UserProfile, "email" | "phone" | "name" | "username">;

export type OnboardingRepairDiagnostics = {
  userId?: string | null;
  email?: string | null;
  memberProfileExists?: boolean;
  appUserExists?: boolean;
  profileName?: string | null;
  profileAge?: number | null;
  profileGender?: string | null;
  profileState?: string | null;
  profileCity?: string | null;
  photosCount?: number;
  mainPhotoUrl?: string | null;
  onboardingCompleted?: boolean;
  setupCompleted?: boolean;
  profileCompletedAt?: string | null;
  onboardingCompletedAt?: string | null;
  completedAt?: string | null;
  hasMinimumData?: boolean;
};

export type RepairOnboardingResult = {
  ok: boolean;
  completed: boolean;
  repaired: boolean;
  nextRoute: "/home" | "/onboarding";
  diagnostics?: OnboardingRepairDiagnostics;
  datingProfile?: Partial<DatingProfile>;
  error?: string;
};

export function logLoginProfileState(
  user: MemberIdentity,
  repair: RepairOnboardingResult | OnboardingStatusResult | null,
  bundle?: { memberProfileId?: string | null; datingProfile?: Record<string, unknown> | null }
): void {
  if (!import.meta.env.DEV) return;
  const remote = bundle?.datingProfile ?? {};
  const status = normalizeOnboardingStatus(remote);
  console.info("[login-profile-state]", {
    userId: repair?.diagnostics?.userId ?? bundle?.memberProfileId ?? null,
    email: user.email || repair?.diagnostics?.email || null,
    memberProfileExists: repair?.diagnostics?.memberProfileExists ?? Boolean(bundle?.datingProfile),
    appUserExists: repair?.diagnostics?.appUserExists ?? null,
    profileName: repair?.diagnostics?.profileName ?? remote.name ?? user.name ?? null,
    profileAge: repair?.diagnostics?.profileAge ?? remote.age ?? null,
    profileGender: repair?.diagnostics?.profileGender ?? remote.gender ?? null,
    profileState: repair?.diagnostics?.profileState ?? remote.state ?? null,
    profileCity: repair?.diagnostics?.profileCity ?? remote.city ?? null,
    photosCount: repair?.diagnostics?.photosCount ?? (Array.isArray(remote.photos) ? remote.photos.length : 0),
    mainPhotoUrl: repair?.diagnostics?.mainPhotoUrl ?? remote.mainPhotoUrl ?? null,
    onboardingCompleted: status.onboardingComplete,
    setupCompleted: status.setupCompleted,
    profileCompletedAt: status.profileCompletedAt ?? null,
    onboardingCompletedAt: status.onboardingCompletedAt ?? null,
    completedAt: status.completedAt ?? null,
    repairCompleted: repair?.completed ?? null,
    repairRepaired: repair?.repaired ?? null,
    reason: "reason" in (repair ?? {}) ? (repair as OnboardingStatusResult).reason : null,
    nextRoute: repair?.nextRoute ?? null
  });
}

export type OnboardingStatusResult = {
  ok: boolean;
  completed: boolean;
  nextRoute: "/home" | "/onboarding";
  reason: string;
  repaired?: boolean;
  diagnostics?: OnboardingRepairDiagnostics;
  datingProfile?: Partial<DatingProfile>;
  error?: string;
};

export async function fetchOnboardingStatus(user: MemberIdentity): Promise<OnboardingStatusResult | null> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=onboarding-status"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        name: user.name,
        username: user.username
      })
    });
    const payload = await readResponseJson<OnboardingStatusResult>(response);
    if (!response.ok || !payload?.ok) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function forceCompleteOnboardingRemote(
  user: MemberIdentity,
  accessToken?: string
): Promise<OnboardingStatusResult | null> {
  try {
    const headers = await memberApiHeaders(
      accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    );
    const response = await fetch(apiUrl("/api/member/data?action=force-complete-onboarding"), {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        name: user.name,
        username: user.username
      })
    });
    const payload = await readResponseJson<OnboardingStatusResult>(response);
    if (!response.ok || !payload?.ok) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function repairOnboardingRemote(user: MemberIdentity): Promise<RepairOnboardingResult | null> {
  try {
    const response = await fetch(apiUrl("/api/member/data?action=repair-onboarding"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        email: user.email,
        phone: user.phone,
        name: user.name,
        username: user.username
      })
    });
    const payload = await readResponseJson<RepairOnboardingResult>(response);
    if (!response.ok || !payload?.ok) return null;
    return payload;
  } catch {
    return null;
  }
}

export function applyOnboardingRepairLocal(repair: RepairOnboardingResult): DatingProfile {
  const current = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
  const patch = repair.datingProfile ?? {};
  const status = normalizeOnboardingStatus({ ...current, ...patch });
  const merged = normalizeDatingProfile({
    ...current,
    ...patch,
    onboardingComplete: status.onboardingComplete,
    setupCompleted: status.setupCompleted,
    profileCompletedAt: status.profileCompletedAt,
    onboardingCompletedAt: status.onboardingCompletedAt,
    completedAt: status.completedAt
  });
  writeJson(STORAGE_KEYS.datingProfile, merged);
  return merged;
}

export function routeFromRepair(repair: RepairOnboardingResult | null): "home" | "onboarding" {
  if (repair?.completed && repair.nextRoute === "/home") return "home";
  if (repair?.completed) return "home";
  return "onboarding";
}

export type { OnboardingStatusSnapshot };
