import { AUTH_SIGNUP_PATH } from "../constants/routes";
import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { profileFromSessionUser, resolveMemberIdentity } from "../utils/authIdentity";
import { clearOnboardingDrafts, logRouteDecision } from "../utils/onboardingStatus";
import { readJson } from "../utils/storage";
import { bootstrapMemberSession } from "./memberData";
import type { OnboardingStatusResult } from "./onboardingRepair";
import { supabase } from "./supabase";

export const OPEN_APP_FAILSAFE_MS = 2000;

const OPEN_APP_SESSION_KEYS = {
  openingState: "bamsignal-opening-state",
  goToAppPending: "bamsignal-go-to-app-pending",
  restorePending: "bamsignal-restore-pending"
} as const;

export type GoToAppResult =
  | { ok: true; route: "home" | "onboarding"; user: UserProfile; status: OnboardingStatusResult | null; hydrated: boolean }
  | { ok: false; route: "login" };

let goToAppInFlight: Promise<GoToAppResult> | null = null;

export function clearOpenAppPendingState(): void {
  if (typeof window === "undefined") return;
  for (const key of Object.values(OPEN_APP_SESSION_KEYS)) {
    sessionStorage.removeItem(key);
  }
}

export function markOpenAppPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(OPEN_APP_SESSION_KEYS.openingState, "1");
  sessionStorage.setItem(OPEN_APP_SESSION_KEYS.goToAppPending, String(Date.now()));
}

export function expireStaleOpenAppState(): boolean {
  if (typeof window === "undefined") return false;
  const pending = sessionStorage.getItem(OPEN_APP_SESSION_KEYS.goToAppPending);
  if (!pending && !sessionStorage.getItem(OPEN_APP_SESSION_KEYS.openingState)) return false;
  clearOpenAppPendingState();
  return true;
}

/** Server-validated Supabase session — not localStorage profile alone. */
export async function validateServerSession(): Promise<{ ok: true; user: UserProfile } | { ok: false }> {
  if (!supabase) return { ok: false };

  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false };

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) {
    await supabase.auth.signOut().catch(() => undefined);
    return { ok: false };
  }

  const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const profile = resolveMemberIdentity(profileFromSessionUser(user), {
    loginEmail: stored.email || undefined
  });
  return { ok: true, user: profile };
}

export function navigateOpenAppFallback(hasSession: boolean): void {
  if (hasSession) {
    window.location.replace("/home");
    return;
  }
  window.location.replace(AUTH_SIGNUP_PATH);
}

/** Authoritative entry from public homepage — session + server hydrate/repair, never local drafts. */
export async function goToApp(options?: {
  forceOnboarding?: boolean;
  referralCode?: string | null;
  loginEmail?: string | null;
}): Promise<GoToAppResult> {
  if (goToAppInFlight) {
    return goToAppInFlight;
  }

  goToAppInFlight = runGoToApp(options).finally(() => {
    goToAppInFlight = null;
  });
  return goToAppInFlight;
}

async function runGoToApp(options?: {
  forceOnboarding?: boolean;
  referralCode?: string | null;
  loginEmail?: string | null;
}): Promise<GoToAppResult> {
  if (!supabase) {
    return { ok: false, route: "login" };
  }

  const validated = await validateServerSession();
  if (!validated.ok) {
    return { ok: false, route: "login" };
  }

  const user = resolveMemberIdentity(validated.user, {
    loginEmail: options?.loginEmail || undefined
  });

  const sessionResult = await bootstrapMemberSession(user, {
    forceOnboarding: options?.forceOnboarding,
    referralCode: options?.referralCode,
    loginEmail: options?.loginEmail || undefined
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

/** Hydrate/repair after fast Open App navigation — never blocks the click handler. */
export function repairGoToAppInBackground(
  options?: {
    forceOnboarding?: boolean;
    referralCode?: string | null;
    loginEmail?: string | null;
  },
  onResult?: (result: GoToAppResult) => void
): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(OPEN_APP_SESSION_KEYS.restorePending, String(Date.now()));
  }
  void goToApp(options)
    .then((result) => {
      onResult?.(result);
    })
    .finally(() => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(OPEN_APP_SESSION_KEYS.restorePending);
      }
    });
}
