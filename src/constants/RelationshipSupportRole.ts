/** Relationship Support™ — role architecture (reserved). No permissions or scheduling yet. */

export const RELATIONSHIP_SUPPORT_TITLE = "Relationship Support™";
export const RELATIONSHIP_SUPPORT_SUBCOPY =
  "Journey Support through thoughtful guidance — human, warm, and private.";
export const RELATIONSHIP_SUPPORT_RESERVED_COPY =
  "Architecture prepared. Advisor permissions and scheduling are not enabled yet.";

export const RELATIONSHIP_SUPPORT_LABEL = "Relationship Support";
export const RELATIONSHIP_GUIDANCE_LABEL = "Guidance";
export const RELATIONSHIP_ADVISORS_LABEL = "Advisors";
export const RELATIONSHIP_JOURNEY_SUPPORT_LABEL = "Journey Support";

export type RelationshipSupportRoleId =
  | "relationship-coach"
  | "marriage-mentor"
  | "family-advisor"
  | "diaspora-relationship-advisor";

export type RelationshipSupportRole = {
  id: RelationshipSupportRoleId;
  label: string;
  description: string;
  journeyFocus: string;
  /** Reserved — not implemented. */
  permissionsEnabled: false;
  /** Reserved — not implemented. */
  schedulingEnabled: false;
};

export const RELATIONSHIP_SUPPORT_ROLES: RelationshipSupportRole[] = [
  {
    id: "relationship-coach",
    label: "Relationship Coach",
    description: "Supports couples through early connection, communication, and growing together.",
    journeyFocus: "Still Talking through Relationship",
    permissionsEnabled: false,
    schedulingEnabled: false
  },
  {
    id: "marriage-mentor",
    label: "Marriage Mentor",
    description: "Guides engaged and pre-marriage journeys with intention and care.",
    journeyFocus: "Exclusive through Engaged",
    permissionsEnabled: false,
    schedulingEnabled: false
  },
  {
    id: "family-advisor",
    label: "Family Advisor",
    description: "Supports family alignment, introductions, and values-centered decisions.",
    journeyFocus: "Family Introduction through Marriage",
    permissionsEnabled: false,
    schedulingEnabled: false
  },
  {
    id: "diaspora-relationship-advisor",
    label: "Diaspora Relationship Advisor",
    description: "Guides cross-border couples through relocation and diaspora adjustment.",
    journeyFocus: "Global journeys and relocation",
    permissionsEnabled: false,
    schedulingEnabled: false
  }
];

export const RELATIONSHIP_SUPPORT_ROLE_LABELS: Record<RelationshipSupportRoleId, string> =
  Object.fromEntries(
    RELATIONSHIP_SUPPORT_ROLES.map((role) => [role.id, role.label])
  ) as Record<RelationshipSupportRoleId, string>;

export type RelationshipSupportFutureCapability =
  | "relationship-coaching"
  | "marriage-preparation"
  | "family-mediation"
  | "diaspora-adjustment-support";

export const RELATIONSHIP_SUPPORT_FUTURE_CAPABILITIES: {
  id: RelationshipSupportFutureCapability;
  label: string;
  description: string;
}[] = [
  {
    id: "relationship-coaching",
    label: "Relationship coaching",
    description: "Reserved — guided conversations for growing together."
  },
  {
    id: "marriage-preparation",
    label: "Marriage preparation",
    description: "Reserved — intentional preparation before marriage."
  },
  {
    id: "family-mediation",
    label: "Family mediation",
    description: "Reserved — family alignment with warmth and respect."
  },
  {
    id: "diaspora-adjustment-support",
    label: "Diaspora adjustment support",
    description: "Reserved — cross-border relationship guidance."
  }
];

export type RelationshipSupportTimelinePhaseId =
  | "journey-support-identified"
  | "advisor-role-mapped"
  | "guidance-pathway"
  | "relationship-coaching"
  | "marriage-preparation"
  | "family-mediation"
  | "diaspora-adjustment";

export const RELATIONSHIP_SUPPORT_TIMELINE_PHASES: {
  id: RelationshipSupportTimelinePhaseId;
  label: string;
  order: number;
  reserved: boolean;
}[] = [
  { id: "journey-support-identified", label: "Journey Support Identified", order: 10, reserved: false },
  { id: "advisor-role-mapped", label: "Advisor Role Mapped", order: 20, reserved: false },
  { id: "guidance-pathway", label: "Guidance Pathway", order: 30, reserved: true },
  { id: "relationship-coaching", label: "Relationship Coaching", order: 40, reserved: true },
  { id: "marriage-preparation", label: "Marriage Preparation", order: 50, reserved: true },
  { id: "family-mediation", label: "Family Mediation", order: 60, reserved: true },
  { id: "diaspora-adjustment", label: "Diaspora Adjustment Support", order: 70, reserved: true }
];

export function relationshipSupportRoleLabel(roleId: RelationshipSupportRoleId): string {
  return RELATIONSHIP_SUPPORT_ROLE_LABELS[roleId];
}

export function getRelationshipSupportRole(roleId: RelationshipSupportRoleId): RelationshipSupportRole | undefined {
  return RELATIONSHIP_SUPPORT_ROLES.find((role) => role.id === roleId);
}
