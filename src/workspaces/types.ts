/**
 * Workspace layer — operating context inside a Stankings Passport.
 * Canonical session state lives in `src/passport/session.ts`.
 */

export type WorkspaceId =
  | "member"
  | "concierge"
  | "admin"
  | "moderator"
  | "support"
  | "vendor";

/** Capability keys scoped to a selected workspace. */
export type WorkspacePermission =
  | "workspace.enter"
  | "workspace.switch"
  | "nav.primary"
  | "dashboard.view"
  | "settings.view";

export type WorkspaceDefinition = {
  id: WorkspaceId;
  label: string;
  shortLabel: string;
  description: string;
  /** URL prefix that implies this workspace. */
  basePath: string;
  /** Default landing path when switching into this workspace. */
  homePath: string;
  /** Auth entry for this workspace (if any). */
  loginPath?: string;
  /**
   * When false, workspace is reserved for future use and never offered
   * until explicitly enabled in the registry.
   */
  shipped: boolean;
  permissions: readonly WorkspacePermission[];
};

export type WorkspaceSessionState = {
  /** Currently selected workspace (persisted). */
  selectedWorkspaceId: WorkspaceId | null;
  /** User preference when multiple workspaces are available. */
  preferredWorkspaceId: WorkspaceId | null;
  /** Workspaces this identity has unlocked (client marker; not a server role). */
  availableWorkspaceIds: WorkspaceId[];
  /** Last in-workspace path for restore after switch / login. */
  lastPathByWorkspace: Partial<Record<WorkspaceId, string>>;
};
