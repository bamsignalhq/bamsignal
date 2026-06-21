import type { ReactNode } from "react";
import { Preloader } from "./Preloader";
import { AUTH_LOGIN_PATH, navigateToPath, normalizePath } from "../constants/routes";
import {
  ONBOARDING_PATH,
  isMemberAppPath,
  isOnboardingPath,
  memberPathForTab,
  parseMemberPath
} from "../constants/memberRoutes";
import type { NavTab } from "../types";

export type MemberRouteGuardInput = {
  authLoading: boolean;
  memberHydrating: boolean;
  isAuthed: boolean;
  profileComplete: boolean | null;
  pathname?: string;
};

export type MemberRouteGuardResult = {
  phase: "loading" | "unauthenticated" | "redirect" | "ready";
  redirectTo?: string;
  memberPath: ReturnType<typeof parseMemberPath>;
  memberTab: NavTab | null;
};

/** Pure route guard — server profileComplete is authoritative once known. */
export function evaluateMemberRouteGuard(input: MemberRouteGuardInput): MemberRouteGuardResult {
  const path = normalizePath(input.pathname ?? window.location.pathname);
  const memberPath = parseMemberPath(path);
  const onMemberSurface = isMemberAppPath(path);

  if (
    input.authLoading ||
    input.memberHydrating ||
    (input.isAuthed && input.profileComplete === null && onMemberSurface)
  ) {
    return { phase: "loading", memberPath, memberTab: null };
  }

  if (onMemberSurface && !input.isAuthed) {
    return { phase: "unauthenticated", redirectTo: AUTH_LOGIN_PATH, memberPath, memberTab: null };
  }

  if (!input.isAuthed || !onMemberSurface) {
    return { phase: "ready", memberPath: null, memberTab: null };
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
      <Preloader
        exiting={false}
        subtitle={memberHydrating ? "Restoring your account…" : "Restoring your session…"}
        showReload={bootStalled}
        onReload={onReload}
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
        subtitle="Redirecting…"
        showReload={bootStalled}
        onReload={onReload}
      />
    );
  }

  return <>{children(result as Extract<MemberRouteGuardResult, { phase: "ready" }>)}</>;
}
