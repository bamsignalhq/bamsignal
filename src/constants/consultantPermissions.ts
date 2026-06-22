import type { ConciergeConsultantRoleId } from "./conciergeConsultantRoles";

export type ConsultantCapability =
  | "view-portfolio"
  | "view-members"
  | "manage-introductions"
  | "manage-followups"
  | "legacy-members"
  | "global-members"
  | "view-legacy-experience"
  | "review-applications"
  | "view-family-journeys"
  | "view-global-members";

export const CONSULTANT_ROLE_CAPABILITIES: Record<ConciergeConsultantRoleId, ConsultantCapability[]> = {
  "relationship-consultant": [
    "view-portfolio",
    "view-members",
    "manage-introductions",
    "manage-followups"
  ],
  "senior-matchmaker": ["legacy-members", "global-members", "view-legacy-experience"],
  "compatibility-specialist": ["review-applications"],
  "family-values-advisor": ["view-family-journeys"],
  "diaspora-consultant": ["view-global-members"]
};

export function capabilitiesForRoles(roles: ConciergeConsultantRoleId[]): ConsultantCapability[] {
  const merged = new Set<ConsultantCapability>();
  for (const role of roles) {
    for (const capability of CONSULTANT_ROLE_CAPABILITIES[role]) {
      merged.add(capability);
    }
  }
  return [...merged];
}

export function roleHasCapability(
  roles: ConciergeConsultantRoleId[],
  capability: ConsultantCapability
): boolean {
  return capabilitiesForRoles(roles).includes(capability);
}
