import { AUTH_SIGNUP_PATH } from "../constants/routes";
import { STORAGE_KEYS } from "../constants/limits";
import type { DatingProfile, UserProfile } from "../types";
import { profileFromSessionUser, resolveMemberIdentity } from "../utils/authIdentity";
import {
  clearOpenAppOnboardingCache,
  readOpenAppOnboardingCache,
  writeOpenAppOnboardingCache
} from "../utils/openAppOnboardingCache";
import { clearOnboardingDrafts, logRouteDecision } from "../utils/onboardingStatus";
import { readJson } from "../utils/storage";
import { bootstrapMemberSession, type MemberSessionBootstrapResult } from "./memberData";
import type { OnboardingStatusResult } from "./onboardingRepair";
import {
  applyOnboardingRepairLocal,
  fetchOnboardingStatusWithTimeout
} from "./onboardingRepair";
import { supabase } from "./supabase";

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
      source: "server" | "cache_fallback";
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

export function navigateOpenAppFallback(hasSession: boolean, authUserId = ""): void {
  if (hasSession && authUserId && readOpenAppOnboardingCache(authUserId)) {
    window.location.replace("/home");
    return;
  }
  window.location.replace(AUTH_SIGNUP_PATH);
}

/** Authoritative entry from public homepage — session + server onboarding status, never local drafts. */
export async function goToApp(options?: {
  forceOnboarding?: boolean;
  referralCode?: string | null;
  loginEmail?: string | null;
  validatedAuth?: { ok: true; user: UserProfile; authUserId: string };
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
  validatedAuth?: { ok: true; user: UserProfile; authUserId: string };
}): Promise<GoToAppResult> {
  if (!supabase) {
    return { ok: false, route: "login" };
  }

  const validated =
    options?.validatedAuth ??
    (await validateServerSessionWithTimeout(OPEN_APP_STATUS_TIMEOUT_MS));
  if (!validated.ok) {
    return { ok: false, route: "login" };
  }

  const user = resolveMemberIdentity(validated.user, {
    loginEmail: options?.loginEmail || undefined
  });
  const authUserId = validated.authUserId;

  if (options?.forceOnboarding) {
    clearOpenAppOnboardingCache(authUserId);
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

  if (statusResult === "timeout" || statusResult === null) {
    if (readOpenAppOnboardingCache(authUserId)) {
      return {
        ok: true,
        route: "home",
        user,
        authUserId,
        status: null,
        hydrated: false,
        source: "cache_fallback"
      };
    }
    return { ok: false, route: "login" };
  }

  if (statusResult.completed || statusResult.nextRoute === "/home") {
    writeOpenAppOnboardingCache(authUserId);
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
  },
  onResult?: (result: MemberSessionBootstrapResult) => void
): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(OPEN_APP_SESSION_KEYS.restorePending, String(Date.now()));
  }
  void bootstrapMemberSession(user, {
    forceOnboarding: options?.forceOnboarding,
    referralCode: options?.referralCode,
    loginEmail: options?.loginEmail || undefined
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
