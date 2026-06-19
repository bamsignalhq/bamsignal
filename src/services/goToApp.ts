import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { profileFromSessionUser, resolveMemberIdentity } from "../utils/authIdentity";
import { getDatingProfile } from "../utils/profile";
import { clearOnboardingDrafts, logRouteDecision } from "../utils/onboardingStatus";
import { readJson } from "../utils/storage";
import { bootstrapMemberSession } from "./memberData";
import type { OnboardingStatusResult } from "./onboardingRepair";
import { supabase } from "./supabase";

const GO_TO_APP_TIMEOUT_MS = 2000;

async function bootstrapWithTimeout(
  user: Parameters<typeof bootstrapMemberSession>[0],
  options?: Parameters<typeof bootstrapMemberSession>[1]
): Promise<Awaited<ReturnType<typeof bootstrapMemberSession>>> {
  let timedOut = false;
  const timeout = new Promise<Awaited<ReturnType<typeof bootstrapMemberSession>>>((resolve) => {
    window.setTimeout(() => {
      timedOut = true;
      resolve({ hydrated: false, status: null, nextRoute: "home" });
    }, GO_TO_APP_TIMEOUT_MS);
  });
  const session = await Promise.race([bootstrapMemberSession(user, options), timeout]);
  if (timedOut) {
    logRouteDecision(user, getDatingProfile(), "home", {
      source: "go_to_app_timeout",
      hydrated: false,
      reason: "repair_timeout_fallback_home"
    });
  }
  return session;
}

export type GoToAppResult =
  | { ok: true; route: "home" | "onboarding"; user: UserProfile; status: OnboardingStatusResult | null; hydrated: boolean }
  | { ok: false; route: "login" };

/** Authoritative entry from public homepage — session + server hydrate/repair, never local drafts. */
export async function goToApp(options?: {
  forceOnboarding?: boolean;
  referralCode?: string | null;
}): Promise<GoToAppResult> {
  if (!supabase) {
    return { ok: false, route: "login" };
  }

  const { data } = await supabase.auth.getSession();
  const sessionUser = data.session?.user;
  if (!sessionUser) {
    return { ok: false, route: "login" };
  }

  const profile = profileFromSessionUser(sessionUser);
  const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const user = resolveMemberIdentity({
    ...profile,
    phone: stored.phone || profile.phone,
    phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
  });

  const sessionResult = await bootstrapWithTimeout(user, {
    forceOnboarding: options?.forceOnboarding,
    referralCode: options?.referralCode
  });
  const rawProfile = readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});

  logRouteDecision(user, rawProfile, sessionResult.nextRoute, {
    source: "go_to_app",
    hydrated: sessionResult.hydrated,
    repaired: sessionResult.status?.repaired,
    repairRoute: sessionResult.status?.nextRoute ?? null,
    reason: sessionResult.status?.reason ?? null
  });

  if (sessionResult.nextRoute === "home") {
    clearOnboardingDrafts();
  }

  return {
    ok: true,
    route: sessionResult.nextRoute,
    user,
    status: sessionResult.status,
    hydrated: sessionResult.hydrated
  };
}
