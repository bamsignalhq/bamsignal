import type { WorkspaceId } from "../../workspaces/types";
import type { PersonaPermission } from "../types";

export type PersonaId =
  | "dating-member"
  | "premium-member"
  | "professional-matchmaker"
  | "premium-concierge"
  | "moderator"
  | "support-agent"
  | "administrator"
  | "vendor"
  | "ambassador";

export type PersonaDefinition = {
  id: PersonaId;
  label: string;
  shortLabel: string;
  description: string;
  workspaceId: WorkspaceId;
  /** Default persona when entering this workspace. */
  isDefaultForWorkspace?: boolean;
  shipped: boolean;
  permissions: readonly PersonaPermission[];
};
