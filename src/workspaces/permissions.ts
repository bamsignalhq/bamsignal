import { getWorkspaceDefinition } from "./registry";
import { getAvailableWorkspaceIds, getSelectedWorkspaceId } from "./session";
import type { WorkspaceId, WorkspacePermission } from "./types";

/**
 * Client-side permission check for the selected (or specified) workspace.
 * Server authorization remains unchanged — this gates UI surfaces only.
 */
export function workspaceCan(
  permission: WorkspacePermission,
  workspaceId?: WorkspaceId | null
): boolean {
  const id = workspaceId ?? getSelectedWorkspaceId();
  if (!id) return false;
  const def = getWorkspaceDefinition(id);
  if (!def.shipped) return false;
  if (id !== "member" && !getAvailableWorkspaceIds().includes(id)) return false;
  return def.permissions.includes(permission);
}

export function canEnterWorkspace(id: WorkspaceId): boolean {
  const def = getWorkspaceDefinition(id);
  if (!def.shipped) return false;
  if (id === "member") return true;
  return getAvailableWorkspaceIds().includes(id);
}
