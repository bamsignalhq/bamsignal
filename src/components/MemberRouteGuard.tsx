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
import { readCachedMemberSession } from "../utils/sessionRestoreBootstrap";

export type MemberRouteGuardInput = {
  authLoading: boolean;
  memberHydrating: boolean;
  memberSessionReady?: boolean;
  isAuthed: boolean;
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

function resolveProfileComplete(input: MemberRouteGuardInput): boolean | null {
  if (input.profileComplete !== null) return input.profileComplete;
  const cached = typeof window !== "undefined" ? readCachedMemberSession() : null;
  if (!cached?.hasSession || !input.isAuthed) return null;
  return cached.profileCompleteKnown;
}

/** Pure route guard — server profileComplete is authoritative once known. */
export function evaluateMemberRouteGuard(input: MemberRouteGuardInput): MemberRouteGuardResult {
  const path = normalizePath(input.pathname ?? window.location.pathname);
  const memberPath = parseMemberPath(path);
  const onMemberSurface = isMemberAppPath(path);
  const cached = typeof window !== "undefined" ? readCachedMemberSession() : null;
  const optimisticReady = Boolean(cached?.hasSession && input.isAuthed && onMemberSurface);
  const profileComplete = resolveProfileComplete(input);

  const sessionPending =
    input.authLoading ||
    input.memberHydrating ||
    (input.isAuthed && onMemberSurface && input.memberSessionReady === false) ||
    (input.isAuthed && input.profileComplete === null && onMemberSurface);

  if (sessionPending && !optimisticReady) {
    return { phase: "loading", memberPath, memberTab: null, sessionPending: true };
  }

  if (onMemberSurface && !input.isAuthed && !input.authLoading) {
    return { phase: "unauthenticated", redirectTo: AUTH_LOGIN_PATH, memberPath, memberTab: null };
  }

  if (onMemberSurface && !input.isAuthed && input.authLoading && !optimisticReady) {
    return { phase: "loading", memberPath, memberTab: null, sessionPending: true };
  }

  if (!input.isAuthed || !onMemberSurface) {
    return { phase: "ready", memberPath: null, memberTab: null, sessionPending: sessionPending && optimisticReady };
  }

  if (profileComplete === false && !isOnboardingPath(path)) {
    return { phase: "redirect", redirectTo: ONBOARDING_PATH, memberPath, memberTab: null };
  }

  if (profileComplete === true && isOnboardingPath(path)) {
    return { phase: "redirect", redirectTo: memberPathForTab("home"), memberPath, memberTab: null };
  }

  if (isOnboardingPath(path)) {
    return { phase: "ready", memberPath: "onboarding", memberTab: null, sessionPending: sessionPending && optimisticReady };
  }

  const memberTab = memberPath && memberPath !== "onboarding" ? memberPath : null;
  return { phase: "ready", memberPath, memberTab, sessionPending: sessionPending && optimisticReady };
}

type MemberRouteGuardProps = MemberRouteGuardInput & {
  bootStalled?: boolean;
  onReload?: () => void;
  onSignOut?: () => void;
  children: (result: Extract<MemberRouteGuardResult, { phase: "ready" }>) => ReactNode;
};

/** Blocks member surfaces until session + profile route are resolved; redirects off /home when incomplete. */
export function MemberRouteGuard({
  authLoading,
  memberHydrating,
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

  return (
    <>
      {result.sessionPending ? (
        <SessionRestoreOverlay active subtitle="Restoring your session…" onRetry={onReload} onSignOut={onSignOut} />
      ) : null}
      {children(result as Extract<MemberRouteGuardResult, { phase: "ready" }>)}
    </>
  );
}
