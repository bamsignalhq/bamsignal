import { isMemberAppPath } from "../constants/memberRoutes";
import { normalizePath } from "../constants/routePath";
import { rememberPassportRoute } from "../passport/session";
import { CONCIERGE_ROUTES } from "../constants/conciergeRoutes";
import { getWorkspaceDefinition } from "./registry";
import {
  markWorkspaceAvailable,
  rememberWorkspacePath,
  resolvePostAuthWorkspacePath,
  resolveWorkspaceFromPath,
  selectWorkspace
} from "./session";
import type { WorkspaceId } from "./types";

/**
 * Keep selected workspace + last in-workspace path aligned with the URL (refresh, deep link, back).
 */
export function syncWorkspaceFromPath(pathname = window.location.pathname): WorkspaceId | null {
  const workspaceId = resolveWorkspaceFromPath(pathname);
  if (!workspaceId) return null;
  const path = normalizePath(pathname);
  if (isWorkspaceAuthenticatedPath(workspaceId, path)) {
    markWorkspaceAvailable(workspaceId);
  }
  selectWorkspace(workspaceId, { setPreferred: false, rememberPath: path });
  rememberPassportRoute(path);
  return workspaceId;
}

/** After auth on a workspace surface — unlock, prefer, and remember entry path. */
export function activateWorkspaceFromAuthSurface(pathname = window.location.pathname): WorkspaceId | null {
  const workspaceId = resolveWorkspaceFromPath(pathname);
  if (!workspaceId) return null;
  markWorkspaceAvailable(workspaceId);
  selectWorkspace(workspaceId, {
    setPreferred: true,
    rememberPath: normalizePath(pathname)
  });
  rememberPassportRoute(normalizePath(pathname));
  return workspaceId;
}

export function isWorkspaceAuthenticatedPath(
  workspaceId: WorkspaceId,
  pathname = window.location.pathname
): boolean {
  const path = normalizePath(pathname);
  if (workspaceId === "concierge") {
    return (
      path === CONCIERGE_ROUTES.onboarding ||
      path === CONCIERGE_ROUTES.dashboard ||
      path === CONCIERGE_ROUTES.status
    );
  }
  if (workspaceId === "member") {
    return path === "/onboarding" || isMemberAppPath(path);
  }
  const def = getWorkspaceDefinition(workspaceId);
  return path === def.homePath || path.startsWith(`${def.basePath}/`);
}

export function resolveAuthenticatedRedirect(options: {
  pathname?: string;
  isNewSignup?: boolean;
}): { workspaceId: WorkspaceId; path: string } {
  return resolvePostAuthWorkspacePath({
    pathname: options.pathname,
    isNewSignup: options.isNewSignup,
    conciergeOnboardingPath: CONCIERGE_ROUTES.onboarding,
    conciergeHomePath: CONCIERGE_ROUTES.dashboard,
    memberOnboardingPath: "/onboarding",
    memberHomePath: "/home"
  });
}

/** Persist member tab navigation inside the member workspace. */
export function rememberMemberWorkspacePath(pathname: string): void {
  const workspaceId = resolveWorkspaceFromPath(pathname);
  if (workspaceId !== "member") return;
  rememberWorkspacePath("member", pathname);
}
