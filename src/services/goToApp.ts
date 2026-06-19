import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { profileFromSessionUser } from "../utils/authIdentity";
import { clearOnboardingDrafts, logRouteDecision } from "../utils/onboardingStatus";
import { readJson } from "../utils/storage";
import { bootstrapMemberSession } from "./memberData";
import { supabase } from "./supabase";

export type GoToAppResult =
  | { ok: true; route: "home" | "onboarding"; user: UserProfile }
  | { ok: false; route: "login" };

/** Authoritative entry from public homepage — session + server hydrate/repair, never local drafts. */
export async function goToApp(options?: { forceOnboarding?: boolean }): Promise<GoToAppResult> {
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
  const user: UserProfile = {
    ...profile,
    phone: stored.phone || profile.phone,
    phoneVerified: Boolean(stored.phoneVerified ?? profile.phoneVerified)
  };

  const sessionResult = await bootstrapMemberSession(user, {
    forceOnboarding: options?.forceOnboarding
  });
  const rawProfile = readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {});

  logRouteDecision(user, rawProfile, sessionResult.nextRoute, {
    source: "go_to_app",
    hydrated: sessionResult.hydrated,
    repaired: sessionResult.repair?.repaired,
    repairRoute: sessionResult.repair?.nextRoute ?? null
  });

  if (sessionResult.nextRoute === "home") {
    clearOnboardingDrafts();
  }

  return { ok: true, route: sessionResult.nextRoute, user };
}
