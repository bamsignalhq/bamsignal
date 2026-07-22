import type { PersonaDefinition, PersonaId } from "./types";

const MEMBER_PERSONA_PERMISSIONS = [
  "persona.view",
  "persona.switch",
  "persona.profile.edit",
  "persona.activity.view"
] as const;

const CONCIERGE_PERSONA_PERMISSIONS = [
  "persona.view",
  "persona.switch",
  "persona.profile.edit",
  "persona.activity.view"
] as const;

const STAFF_PERSONA_PERMISSIONS = ["persona.view", "persona.switch"] as const;

/**
 * Registry-driven personas — add entries here; never hardcode switcher branches.
 */
export const PERSONA_REGISTRY: readonly PersonaDefinition[] = [
  {
    id: "dating-member",
    label: "Dating Member",
    shortLabel: "Member",
    description: "Discover, signals, and chats on BamSignal",
    workspaceId: "member",
    isDefaultForWorkspace: true,
    shipped: true,
    permissions: MEMBER_PERSONA_PERMISSIONS
  },
  {
    id: "premium-member",
    label: "Premium Member",
    shortLabel: "Premium",
    description: "Signal Pass member with premium discovery",
    workspaceId: "member",
    shipped: true,
    permissions: MEMBER_PERSONA_PERMISSIONS
  },
  {
    id: "professional-matchmaker",
    label: "Professional Matchmaker",
    shortLabel: "Matchmaker",
    description: "Consultant-led introductions (future)",
    workspaceId: "member",
    shipped: false,
    permissions: MEMBER_PERSONA_PERMISSIONS
  },
  {
    id: "premium-concierge",
    label: "Premium Concierge",
    shortLabel: "Concierge",
    description: "Private Signal Concierge client persona",
    workspaceId: "concierge",
    isDefaultForWorkspace: true,
    shipped: true,
    permissions: CONCIERGE_PERSONA_PERMISSIONS
  },
  {
    id: "moderator",
    label: "Moderator",
    shortLabel: "Moderator",
    description: "Trust and safety moderation",
    workspaceId: "moderator",
    isDefaultForWorkspace: true,
    shipped: false,
    permissions: STAFF_PERSONA_PERMISSIONS
  },
  {
    id: "support-agent",
    label: "Support Agent",
    shortLabel: "Support",
    description: "Member support desk",
    workspaceId: "support",
    isDefaultForWorkspace: true,
    shipped: false,
    permissions: STAFF_PERSONA_PERMISSIONS
  },
  {
    id: "administrator",
    label: "Administrator",
    shortLabel: "Admin",
    description: "Hard console operations",
    workspaceId: "admin",
    isDefaultForWorkspace: true,
    shipped: false,
    permissions: STAFF_PERSONA_PERMISSIONS
  },
  {
    id: "vendor",
    label: "Vendor",
    shortLabel: "Vendor",
    description: "Partner vendor portal",
    workspaceId: "vendor",
    isDefaultForWorkspace: true,
    shipped: false,
    permissions: STAFF_PERSONA_PERMISSIONS
  },
  {
    id: "ambassador",
    label: "Ambassador",
    shortLabel: "Ambassador",
    description: "City and community ambassador (future)",
    workspaceId: "member",
    shipped: false,
    permissions: MEMBER_PERSONA_PERMISSIONS
  }
] as const;

const BY_ID = Object.fromEntries(PERSONA_REGISTRY.map((p) => [p.id, p])) as Record<
  PersonaId,
  PersonaDefinition
>;

export function getPersonaDefinition(id: PersonaId): PersonaDefinition {
  return BY_ID[id];
}

export function isKnownPersonaId(value: string | null | undefined): value is PersonaId {
  return Boolean(value && value in BY_ID);
}

export function listShippedPersonas(): PersonaDefinition[] {
  return PERSONA_REGISTRY.filter((p) => p.shipped);
}

export function listPersonasForWorkspace(workspaceId: PersonaDefinition["workspaceId"]): PersonaDefinition[] {
  return listShippedPersonas().filter((p) => p.workspaceId === workspaceId);
}

export function defaultPersonaForWorkspace(workspaceId: PersonaDefinition["workspaceId"]): PersonaId | null {
  const match =
    listPersonasForWorkspace(workspaceId).find((p) => p.isDefaultForWorkspace) ??
    listPersonasForWorkspace(workspaceId)[0];
  return match?.id ?? null;
}
