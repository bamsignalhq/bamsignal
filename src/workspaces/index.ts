export type {
  WorkspaceId,
  WorkspacePermission,
  WorkspaceDefinition,
  WorkspaceSessionState
} from "./types";

export {
  WORKSPACE_REGISTRY,
  getWorkspaceDefinition,
  listShippedWorkspaces,
  listRegistryWorkspaceIds,
  isKnownWorkspaceId
} from "./registry";

export {
  getWorkspaceSession,
  getSelectedWorkspaceId,
  getPreferredWorkspaceId,
  getAvailableWorkspaceIds,
  hasMultipleWorkspaces,
  markWorkspaceAvailable,
  selectWorkspace,
  rememberWorkspacePath,
  getLastWorkspacePath,
  resolveWorkspaceFromPath,
  resolvePostAuthWorkspacePath,
  resolveSwitchPath
} from "./session";

export { workspaceCan, canEnterWorkspace } from "./permissions";

export {
  syncWorkspaceFromPath,
  activateWorkspaceFromAuthSurface,
  isWorkspaceAuthenticatedPath,
  resolveAuthenticatedRedirect,
  rememberMemberWorkspacePath
} from "./routing";
