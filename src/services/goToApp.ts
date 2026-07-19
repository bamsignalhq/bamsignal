import { AUTH_SIGNUP_PATH } from "../constants/routes";
import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { profileFromSessionUser, resolveMemberIdentity } from "../utils/authIdentity";
import {
  clearOpenAppOnboardingCache
} from "../utils/openAppOnboardingCache";
import { clearOnboardingDrafts } from "../utils/onboardingDrafts";
import { logAuthRoute } from "../utils/authRouteLog";
import { logRouteDecision } from "../utils/profileOnboardingRepair";
import { readJson } from "../utils/storage";
import { bootstrapMemberSession, type MemberSessionBootstrapResult } from "./memberData";
import type { OnboardingStatusResult } from "./onboardingRepair";
import {
  applyOnboardingRepairLocal,
  fetchOnboardingStatusWithTimeout
} from "./onboardingRepair";
import { supabase } from "./supabase";
import { debugSessionCall } from "../utils/debugRecursion";
import { markStartupPhase } from "../utils/startupInstrumentation";

export const OPEN_APP_FAILSAFE_MS = 2000;
export const OPEN_APP_STATUS_TIMEOUT_MS = 2000;

const OPEN_APP_SESSION_KEYS = {
  openingState: "bamsignal-opening-state",
  goToAppPending: "bamsignal-go-to-app-pending",
  restorePending: "bamsignal-restore-pending"
} as const;

export type GoToAppResult =
  | {
      ok: true;
      route: "home" | "onboarding";
      user: UserProfile;
      authUserId: string;
      status: OnboardingStatusResult | null;
      hydrated: boolean;
      source: "server";
    }
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

async function readValidatedSession(): Promise<
  { ok: true; user: UserProfile; authUserId: string } | { ok: false }
> {
  if (!supabase) return { ok: false };

  markStartupPhase("supabase_get_session");
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false };

  markStartupPhase("supabase_validate_user");
  let user = session.user;
  try {
    const userResult = await Promise.race([
      supabase.auth.getUser(),
      new Promise<Awaited<ReturnType<typeof supabase.auth.getUser>>>((resolve) => {
        setTimeout(
          () =>
            resolve({
              data: { user: null },
              error: { message: "get_user_timeout", name: "AuthTimeout", status: 408 } as never
            }),
          OPEN_APP_STATUS_TIMEOUT_MS
        );
      })
    ]);
    if (!userResult.error && userResult.data.user) {
      user = userResult.data.user;
    } else if (userResult.error && String(userResult.error.message || "") !== "get_user_timeout") {
      await supabase.auth.signOut().catch(() => undefined);
      return { ok: false };
    }
  } catch {
    /* keep session.user fallback */
  }

  const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  const profile = resolveMemberIdentity(profileFromSessionUser(user), {
    loginEmail: stored.email || undefined
  });
  return { ok: true, user: profile, authUserId: user.id };
}

/** Server-validated Supabase session — not localStorage profile alone. */
export async function validateServerSession(): Promise<
  { ok: true; user: UserProfile; authUserId: string } | { ok: false }
> {
  return readValidatedSession();
}

export async function validateServerSessionWithTimeout(
  timeoutMs = OPEN_APP_STATUS_TIMEOUT_MS
): Promise<{ ok: true; user: UserProfile; authUserId: string } | { ok: false }> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      readValidatedSession(),
      new Promise<{ ok: false }>((resolve) => {
        timer = setTimeout(() => resolve({ ok: false }), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Without server onboarding status, never invent a home/onboarding route from client cache. */
export function navigateOpenAppFallback(_hasSession: boolean, _authUserId = ""): void {
  window.location.replace(AUTH_SIGNUP_PATH);
}

/** Authoritative entry — session + server onboarding status only. */
export async function goToApp(options?: {
  forceOnboarding?: boolean;
  referralCode?: string | null;
  loginEmail?: string | null;
  validatedAuth?: { ok: true; user: UserProfile; authUserId: string };
}): Promise<GoToAppResult> {
  debugSessionCall("goToApp");
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
  validatedAuth?: { ok: true; user: UserProfile; authUserId: string };
}): Promise<GoToAppResult> {
  if (!supabase) {
    return { ok: false, route: "login" };
  }

  markStartupPhase("go_to_app");
  const validated =
    options?.validatedAuth ??
    (await validateServerSessionWithTimeout(OPEN_APP_STATUS_TIMEOUT_MS));
  if (!validated.ok) {
    logAuthRoute("REDIRECT_REASON", { reason: "auth_session_invalid", route: "login" });
    return { ok: false, route: "login" };
  }

  logAuthRoute("AUTH_SUCCESS", { authUserId: validated.authUserId });

  const user = resolveMemberIdentity(validated.user, {
    loginEmail: options?.loginEmail || undefined
  });
  const authUserId = validated.authUserId;

  if (options?.forceOnboarding) {
    clearOpenAppOnboardingCache(authUserId);
    logAuthRoute("ROUTE_SELECTED", {
      route: "onboarding",
      reason: "force_new_signup",
      authUserId
    });
    return {
      ok: true,
      route: "onboarding",
      user,
      authUserId,
      status: null,
      hydrated: false,
      source: "server"
    };
  }

  const statusResult = await fetchOnboardingStatusWithTimeout(user, OPEN_APP_STATUS_TIMEOUT_MS);
  markStartupPhase("onboarding_status");

  if (statusResult === "timeout" || statusResult === null) {
    logAuthRoute("REDIRECT_REASON", {
      reason: statusResult === "timeout" ? "onboarding_status_timeout" : "onboarding_status_unavailable",
      route: "login",
      authUserId
    });
    return { ok: false, route: "login" };
  }

  logAuthRoute("PROFILE_FETCHED", {
    authUserId,
    completed: statusResult.completed,
    nextRoute: statusResult.nextRoute,
    reason: statusResult.reason
  });
  logAuthRoute("PROFILE_COMPLETED", {
    authUserId,
    onboardingCompleted: Boolean(statusResult.completed),
    reason: statusResult.reason
  });

  if (statusResult.completed || statusResult.nextRoute === "/home") {
    clearOpenAppOnboardingCache(authUserId);
    if (statusResult.datingProfile) {
      applyOnboardingRepairLocal({
        ok: true,
        completed: true,
        repaired: Boolean(statusResult.repaired),
        nextRoute: "/home",
        datingProfile: statusResult.datingProfile
      });
    }
    clearOnboardingDrafts();
    logRouteDecision(user, readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {}), "home", {
      source: "go_to_app",
      hydrated: false,
      repaired: statusResult.repaired,
      repairRoute: statusResult.nextRoute,
      reason: statusResult.reason
    });
    logAuthRoute("ROUTE_SELECTED", {
      route: "home",
      reason: statusResult.reason || "server_onboarding_complete",
      authUserId
    });
    return {
      ok: true,
      route: "home",
      user,
      authUserId,
      status: statusResult,
      hydrated: false,
      source: "server"
    };
  }

  clearOpenAppOnboardingCache(authUserId);
  logRouteDecision(user, readJson<Partial<DatingProfile>>(STORAGE_KEYS.datingProfile, {}), "onboarding", {
    source: "go_to_app",
    hydrated: false,
    repaired: statusResult.repaired,
    repairRoute: statusResult.nextRoute,
    reason: statusResult.reason
  });
  logAuthRoute("ROUTE_SELECTED", {
    route: "onboarding",
    reason: statusResult.reason || "server_onboarding_incomplete",
    authUserId
  });
  return {
    ok: true,
    route: "onboarding",
    user,
    authUserId,
    status: statusResult,
    hydrated: false,
    source: "server"
  };
}

/** Hydrate member bundle after routing — never blocks Open App click handler. */
export function hydrateMemberAppInBackground(
  user: Pick<UserProfile, "email" | "phone" | "name" | "username">,
  options?: {
    forceOnboarding?: boolean;
    referralCode?: string | null;
    loginEmail?: string | null;
    skipOnboardingStatus?: boolean;
  },
  onResult?: (result: MemberSessionBootstrapResult) => void
): void {
  debugSessionCall("hydrateMemberAppInBackground");
  markStartupPhase("background_tasks");
  if (typeof window !== "undefined") {
    sessionStorage.setItem(OPEN_APP_SESSION_KEYS.restorePending, String(Date.now()));
  }
  void bootstrapMemberSession(user, {
    forceOnboarding: options?.forceOnboarding,
    referralCode: options?.referralCode,
    loginEmail: options?.loginEmail || undefined,
    skipOnboardingStatus: options?.skipOnboardingStatus
  })
    .then((result) => {
      onResult?.(result);
    })
    .finally(() => {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(OPEN_APP_SESSION_KEYS.restorePending);
      }
    });
}

/** @deprecated Use hydrateMemberAppInBackground after goToApp routing. */
export function repairGoToAppInBackground(
  options?: {
    forceOnboarding?: boolean;
    referralCode?: string | null;
    loginEmail?: string | null;
  },
  onResult?: (result: GoToAppResult) => void
): void {
  const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  hydrateMemberAppInBackground(
    stored,
    options,
    onResult
      ? (bootstrap) => {
          onResult({
            ok: true,
            route: bootstrap.nextRoute,
            user: stored,
            authUserId: "",
            status: bootstrap.status,
            hydrated: bootstrap.hydrated,
            source: "server"
          });
        }
      : undefined
  );
}
