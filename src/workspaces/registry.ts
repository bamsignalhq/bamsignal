import { CONCIERGE_ROUTES, CONCIERGE_BASE_PATH } from "../constants/conciergeRoutes";
import type { WorkspaceDefinition, WorkspaceId, WorkspacePermission } from "./types";

const MEMBER_PERMISSIONS: readonly WorkspacePermission[] = [
  "workspace.enter",
  "workspace.switch",
  "nav.primary",
  "dashboard.view",
  "settings.view"
];

const CONCIERGE_PERMISSIONS: readonly WorkspacePermission[] = [
  "workspace.enter",
  "workspace.switch",
  "nav.primary",
  "dashboard.view",
  "settings.view"
];

const FUTURE_PERMISSIONS: readonly WorkspacePermission[] = ["workspace.enter", "workspace.switch"];

/**
 * Extensible workspace registry.
 * Add future workspaces here — do not hardcode switcher branches on Member/Concierge.
 */
export const WORKSPACE_REGISTRY: readonly WorkspaceDefinition[] = [
  {
    id: "member",
    label: "Member",
    shortLabel: "Member",
    description: "Discover, chats, signals, and your BamSignal profile",
    basePath: "/home",
    homePath: "/home",
    loginPath: "/love/login",
    shipped: true,
    permissions: MEMBER_PERMISSIONS
  },
  {
    id: "concierge",
    label: "Signal Concierge",
    shortLabel: "Concierge",
    description: "Private relationship advisory client workspace",
    basePath: CONCIERGE_BASE_PATH,
    homePath: CONCIERGE_ROUTES.dashboard,
    loginPath: CONCIERGE_ROUTES.login,
    shipped: true,
    permissions: CONCIERGE_PERMISSIONS
  },
  {
    id: "admin",
    label: "Admin",
    shortLabel: "Admin",
    description: "Hard console operations (future workspace surface)",
    basePath: "/hard",
    homePath: "/hard",
    shipped: false,
    permissions: FUTURE_PERMISSIONS
  },
  {
    id: "moderator",
    label: "Moderator",
    shortLabel: "Moderator",
    description: "Trust and safety moderation (future)",
    basePath: "/moderator",
    homePath: "/moderator",
    shipped: false,
    permissions: FUTURE_PERMISSIONS
  },
  {
    id: "support",
    label: "Support",
    shortLabel: "Support",
    description: "Member support desk (future)",
    basePath: "/support-desk",
    homePath: "/support-desk",
    shipped: false,
    permissions: FUTURE_PERMISSIONS
  },
  {
    id: "vendor",
    label: "Vendor",
    shortLabel: "Vendor",
    description: "Partner vendor portal (future)",
    basePath: "/vendor",
    homePath: "/vendor",
    shipped: false,
    permissions: FUTURE_PERMISSIONS
  }
] as const;

const BY_ID = Object.fromEntries(WORKSPACE_REGISTRY.map((w) => [w.id, w])) as Record<
  WorkspaceId,
  WorkspaceDefinition
>;

export function getWorkspaceDefinition(id: WorkspaceId): WorkspaceDefinition {
  return BY_ID[id];
}

export function listShippedWorkspaces(): WorkspaceDefinition[] {
  return WORKSPACE_REGISTRY.filter((w) => w.shipped);
}

export function listRegistryWorkspaceIds(): WorkspaceId[] {
  return WORKSPACE_REGISTRY.map((w) => w.id);
}

export function isKnownWorkspaceId(value: string | null | undefined): value is WorkspaceId {
  return Boolean(value && value in BY_ID);
}
