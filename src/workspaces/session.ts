import { normalizePath } from "../constants/routePath";
import { isConciergeRoute } from "../constants/conciergeRoutes";
import { isSignalConciergeRoute } from "../constants/signalConciergeRoutes";
import { isHardRoute, getAuthPath } from "../constants/routes";
import { isMemberAppPath } from "../constants/memberRoutes";
import {
  getPassportWorkspaceSlice,
  patchPassportWorkspaceSlice,
  syncPersonaForWorkspace
} from "../passport/session";
import { appendPassportAuditEvent } from "../passport/audit";
import { getWorkspaceDefinition, listShippedWorkspaces } from "./registry";
import type { WorkspaceId, WorkspaceSessionState } from "./types";

export function getWorkspaceSession(): WorkspaceSessionState {
  return getPassportWorkspaceSlice();
}

function writeWorkspaceSession(state: WorkspaceSessionState): void {
  patchPassportWorkspaceSlice(state);
}

export function getSelectedWorkspaceId(): WorkspaceId | null {
  return getWorkspaceSession().selectedWorkspaceId;
}

export function getPreferredWorkspaceId(): WorkspaceId | null {
  return getWorkspaceSession().preferredWorkspaceId;
}

export function getAvailableWorkspaceIds(): WorkspaceId[] {
  const shipped = new Set(listShippedWorkspaces().map((w) => w.id));
  return getWorkspaceSession().availableWorkspaceIds.filter((id) => shipped.has(id));
}

export function hasMultipleWorkspaces(): boolean {
  return getAvailableWorkspaceIds().length > 1;
}

export function markWorkspaceAvailable(id: WorkspaceId): void {
  const def = getWorkspaceDefinition(id);
  if (!def.shipped) return;
  const state = getWorkspaceSession();
  if (state.availableWorkspaceIds.includes(id)) return;
  writeWorkspaceSession({
    ...state,
    availableWorkspaceIds: [...state.availableWorkspaceIds, id]
  });
  appendPassportAuditEvent({
    category: "workspace",
    action: "workspace.unlocked",
    workspaceId: id
  });
}

export function selectWorkspace(
  id: WorkspaceId,
  options?: { setPreferred?: boolean; rememberPath?: string }
): void {
  const def = getWorkspaceDefinition(id);
  if (!def.shipped) return;
  const state = getWorkspaceSession();
  const available = state.availableWorkspaceIds.includes(id)
    ? state.availableWorkspaceIds
    : [...state.availableWorkspaceIds, id];
  const lastPathByWorkspace = { ...state.lastPathByWorkspace };
  if (options?.rememberPath) {
    lastPathByWorkspace[id] = options.rememberPath;
  }
  writeWorkspaceSession({
    selectedWorkspaceId: id,
    preferredWorkspaceId: options?.setPreferred === false ? state.preferredWorkspaceId : id,
    availableWorkspaceIds: available,
    lastPathByWorkspace
  });
  syncPersonaForWorkspace(id);
  appendPassportAuditEvent({
    category: "workspace",
    action: "workspace.selected",
    workspaceId: id
  });
}

export function rememberWorkspacePath(id: WorkspaceId, path: string): void {
  const state = getWorkspaceSession();
  writeWorkspaceSession({
    ...state,
    lastPathByWorkspace: {
      ...state.lastPathByWorkspace,
      [id]: normalizePath(path)
    }
  });
}

export function getLastWorkspacePath(id: WorkspaceId): string | null {
  return getWorkspaceSession().lastPathByWorkspace[id] ?? null;
}

/** Resolve which workspace a URL belongs to (deep link / refresh). */
export function resolveWorkspaceFromPath(pathname = window.location.pathname): WorkspaceId | null {
  const path = normalizePath(pathname);
  if (isConciergeRoute(path) || isSignalConciergeRoute(path)) return "concierge";
  if (isHardRoute(path)) return "admin";
  if (isMemberAppPath(path)) return "member";
  if (getAuthPath(path)) return "member";
  for (const workspace of listShippedWorkspaces()) {
    if (workspace.id === "member" || workspace.id === "concierge") continue;
    if (path === workspace.basePath || path.startsWith(`${workspace.basePath}/`)) {
      return workspace.id;
    }
  }
  return null;
}

export function resolvePostAuthWorkspacePath(options: {
  pathname?: string;
  isNewSignup?: boolean;
  conciergeOnboardingPath?: string;
  conciergeHomePath?: string;
  memberOnboardingPath?: string;
  memberHomePath?: string;
}): { workspaceId: WorkspaceId; path: string } {
  const pathname = options.pathname ?? window.location.pathname;
  const fromPath = resolveWorkspaceFromPath(pathname);
  const preferred = getPreferredWorkspaceId();
  const selected = getSelectedWorkspaceId();
  const available = new Set(getAvailableWorkspaceIds());

  if (fromPath === "concierge") {
    const path = options.isNewSignup
      ? options.conciergeOnboardingPath ?? getWorkspaceDefinition("concierge").homePath
      : getLastWorkspacePath("concierge") ||
        options.conciergeHomePath ||
        getWorkspaceDefinition("concierge").homePath;
    return { workspaceId: "concierge", path };
  }

  if (fromPath === "member" || getAuthPath(pathname)) {
    if (options.isNewSignup) {
      return {
        workspaceId: "member",
        path: options.memberOnboardingPath ?? "/onboarding"
      };
    }
    return {
      workspaceId: "member",
      path: options.memberHomePath ?? getWorkspaceDefinition("member").homePath
    };
  }

  const candidate =
    (preferred && available.has(preferred) ? preferred : null) ||
    (selected && available.has(selected) ? selected : null) ||
    "member";

  if (candidate === "concierge") {
    return {
      workspaceId: "concierge",
      path:
        getLastWorkspacePath("concierge") ||
        options.conciergeHomePath ||
        getWorkspaceDefinition("concierge").homePath
    };
  }

  return {
    workspaceId: "member",
    path: options.isNewSignup
      ? options.memberOnboardingPath ?? "/onboarding"
      : options.memberHomePath ?? getWorkspaceDefinition("member").homePath
  };
}

export function resolveSwitchPath(id: WorkspaceId): string {
  const def = getWorkspaceDefinition(id);
  const last = getLastWorkspacePath(id);
  if (!last) return def.homePath;
  if (resolveWorkspaceFromPath(last) === id) return last;
  return def.homePath;
}
