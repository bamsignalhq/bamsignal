import type { ReactNode } from "react";
import { Preloader } from "./Preloader";
import { SessionRestoreOverlay } from "./SessionRestoreOverlay";
import { AUTH_LOGIN_PATH, navigateToPath, normalizePath } from "../constants/routes";
import {
  ONBOARDING_PATH,
  isMemberAppPath,
  isOnboardingPath,
  memberPathForTab,
  parseMemberPath
} from "../constants/memberRoutes";
import type { NavTab } from "../types";
import { logAuthRoute } from "../utils/authRouteLog";

export type MemberRouteGuardInput = {
  authLoading: boolean;
  memberHydrating: boolean;
  memberSessionReady?: boolean;
  isAuthed: boolean;
  /** Server-derived only. null = not yet known — never guess from client cache. */
  profileComplete: boolean | null;
  pathname?: string;
};

export type MemberRouteGuardResult = {
  phase: "loading" | "unauthenticated" | "redirect" | "ready";
  redirectTo?: string;
  memberPath: ReturnType<typeof parseMemberPath>;
  memberTab: NavTab | null;
  sessionPending?: boolean;
};

/**
 * Pure route guard — completion must come from backend profileComplete.
 * Client caches must never decide onboarding vs home.
 */
export function evaluateMemberRouteGuard(input: MemberRouteGuardInput): MemberRouteGuardResult {
  const path = normalizePath(input.pathname ?? window.location.pathname);
  const memberPath = parseMemberPath(path);
  const onMemberSurface = isMemberAppPath(path);

  if (input.authLoading || input.memberHydrating) {
    return { phase: "loading", memberPath, memberTab: null, sessionPending: true };
  }

  if (onMemberSurface && !input.isAuthed) {
    return { phase: "unauthenticated", redirectTo: AUTH_LOGIN_PATH, memberPath, memberTab: null };
  }

  if (!input.isAuthed || !onMemberSurface) {
    return { phase: "ready", memberPath: null, memberTab: null };
  }

  if (input.memberSessionReady === false || input.profileComplete === null) {
    return { phase: "loading", memberPath, memberTab: null, sessionPending: true };
  }

  if (input.profileComplete === false && !isOnboardingPath(path)) {
    return { phase: "redirect", redirectTo: ONBOARDING_PATH, memberPath, memberTab: null };
  }

  if (input.profileComplete === true && isOnboardingPath(path)) {
    return { phase: "redirect", redirectTo: memberPathForTab("home"), memberPath, memberTab: null };
  }

  if (isOnboardingPath(path)) {
    return { phase: "ready", memberPath: "onboarding", memberTab: null };
  }

  const memberTab = memberPath && memberPath !== "onboarding" ? memberPath : null;
  return { phase: "ready", memberPath, memberTab };
}

type MemberRouteGuardProps = MemberRouteGuardInput & {
  bootStalled?: boolean;
  onReload?: () => void;
  onSignOut?: () => void;
  children: (result: Extract<MemberRouteGuardResult, { phase: "ready" }>) => ReactNode;
};

/** Blocks member surfaces until session + server profile route are resolved. */
export function MemberRouteGuard({
  authLoading,
  memberHydrating,
  memberSessionReady,
  isAuthed,
  profileComplete,
  pathname,
  bootStalled,
  onReload,
  onSignOut,
  children
}: MemberRouteGuardProps) {
  const result = evaluateMemberRouteGuard({
    authLoading,
    memberHydrating,
    memberSessionReady,
    isAuthed,
    profileComplete,
    pathname
  });

  if (result.phase === "loading") {
    return (
      <SessionRestoreOverlay
        active
        subtitle={memberHydrating ? "Restoring your session…" : "Restoring your session…"}
        onRetry={onReload}
        onSignOut={onSignOut}
      />
    );
  }

  if (result.phase === "unauthenticated" || result.phase === "redirect") {
    if (result.redirectTo && normalizePath(window.location.pathname) !== normalizePath(result.redirectTo)) {
      logAuthRoute("REDIRECT_REASON", {
        from: pathname ?? window.location.pathname,
        to: result.redirectTo,
        reason:
          result.phase === "unauthenticated"
            ? "unauthenticated_member_surface"
            : profileComplete === false
              ? "server_profile_incomplete"
              : "server_profile_complete_leave_onboarding",
        profileComplete
      });
      navigateToPath(result.redirectTo, true);
    }
    return (
      <Preloader
        exiting={false}
        variant="minimal"
        subtitle="Redirecting…"
        showReload={bootStalled}
        onReload={onReload}
      />
    );
  }

  return <>{children(result as Extract<MemberRouteGuardResult, { phase: "ready" }>)}</>;
}
