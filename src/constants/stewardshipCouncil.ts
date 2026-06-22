/** Stewardship Council™ — institutional custodians architecture. */

import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const STEWARDSHIP_COUNCIL_TITLE = "Stewardship Council™";
export const STEWARDSHIP_COUNCIL_LABEL = "Stewardship Council";
export const COUNCIL_ROLE_LABEL = "Council Role";
export const COUNCIL_MEMBER_LABEL = "Council Seat";

export const STEWARDSHIP_COUNCIL_SUBCOPY =
  "Stewardship Council™ — custodians for mission, family, community, research, faith, legacy, diaspora, and institution.";
export const STEWARDSHIP_COUNCIL_PURPOSE_COPY =
  "Build stewardship council architecture — institutions require custodians. Documented only, not authority, permissions, or workflows.";
export const STEWARDSHIP_COUNCIL_RESERVED_COPY =
  "Architecture prepared. Council sessions, annual reviews, and institution oversight are not enabled yet.";

export { UNDERSTANDING_RELATIONSHIPS_LABEL };

export type CouncilRoleId =
  | "chairman"
  | "family-steward"
  | "community-steward"
  | "research-steward"
  | "faith-steward"
  | "legacy-steward"
  | "diaspora-steward"
  | "institution-steward";

export type CouncilRoleDefinition = {
  id: CouncilRoleId;
  title: string;
  description: string;
  roleOrder: number;
};

export const COUNCIL_ROLES: CouncilRoleDefinition[] = [
  {
    id: "chairman",
    title: "Chairman",
    description: "Stewards council cohesion and century horizon — servant leadership, not executive power.",
    roleOrder: 1
  },
  {
    id: "family-steward",
    title: "Family Steward",
    description: "Guards family dignity across products, concierge journeys, and House programmes.",
    roleOrder: 2
  },
  {
    id: "community-steward",
    title: "Community Steward",
    description: "Custodian of community growth with local respect — never extraction or spectacle.",
    roleOrder: 3
  },
  {
    id: "research-steward",
    title: "Research Steward",
    description: "Oversees House Institute research ethics — anonymous aggregates only.",
    roleOrder: 4
  },
  {
    id: "faith-steward",
    title: "Faith Steward",
    description: "Holds faith with dignity in institutional life — never performance or pressure.",
    roleOrder: 5
  },
  {
    id: "legacy-steward",
    title: "Legacy Steward",
    description: "Protects legacy families, archives, and multi-generational stewardship.",
    roleOrder: 6
  },
  {
    id: "diaspora-steward",
    title: "Diaspora Steward",
    description: "Stewards diaspora corridors and cross-border dignity — corridor aggregates, not identities.",
    roleOrder: 7
  },
  {
    id: "institution-steward",
    title: "Institution Steward",
    description: "Custodian of The BamSignal House™, Institute, Observatory, and Governance Framework alignment.",
    roleOrder: 8
  }
];

export type StewardshipCouncilPrincipleId =
  | "serve-mission"
  | "protect-families"
  | "preserve-trust"
  | "guard-legacy"
  | "think-generations";

export type StewardshipCouncilPrincipleDefinition = {
  id: StewardshipCouncilPrincipleId;
  title: string;
  description: string;
  principleOrder: number;
};

export const STEWARDSHIP_COUNCIL_PRINCIPLES: StewardshipCouncilPrincipleDefinition[] = [
  {
    id: "serve-mission",
    title: "Serve the mission",
    description: "Custodians exist to serve BamSignal's dignified relationship mission — never personal ambition.",
    principleOrder: 1
  },
  {
    id: "protect-families",
    title: "Protect families",
    description: "Family outcomes outweigh growth metrics in every council deliberation.",
    principleOrder: 2
  },
  {
    id: "preserve-trust",
    title: "Preserve trust",
    description: "Trust is institutional capital — guarded across products, consultants, and research.",
    principleOrder: 3
  },
  {
    id: "guard-legacy",
    title: "Guard the legacy",
    description: "Legacy is measured in generations — stewardship extends beyond founders.",
    principleOrder: 4
  },
  {
    id: "think-generations",
    title: "Think in generations",
    description: "Council decisions honour the century ahead — not quarterly convenience.",
    principleOrder: 5
  }
];

export type CouncilTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export const COUNCIL_TIMELINE_ENTRIES: CouncilTimelineEntry[] = [
  {
    id: "stc_timeline_council_prepared",
    label: "Stewardship Council architecture prepared",
    recordedAt: "2026-02-01T00:00:00.000Z",
    note: "Eight council roles documented — no authority system or workflows."
  },
  {
    id: "stc_timeline_oath_defined",
    label: "Stewardship oath principles defined",
    recordedAt: "2026-04-01T00:00:00.000Z",
    note: "Serve mission, protect families, preserve trust, guard legacy, think in generations."
  },
  {
    id: "stc_timeline_oversight_reserved",
    label: "Institution oversight pathway reserved",
    recordedAt: "2026-06-01T00:00:00.000Z",
    note: "Council sessions and annual reviews documented for future readiness only."
  }
];

export type CouncilResponsibilityDefinition = {
  id: string;
  roleId: CouncilRoleId;
  title: string;
  description: string;
  responsibilityOrder: number;
};

export const COUNCIL_RESPONSIBILITIES: CouncilResponsibilityDefinition[] = [
  {
    id: "chairman-cohesion",
    roleId: "chairman",
    title: "Council cohesion",
    description: "Hold space for dignified council deliberation — architecture only, not voting.",
    responsibilityOrder: 1
  },
  {
    id: "family-dignity",
    roleId: "family-steward",
    title: "Family dignity",
    description: "Review family-facing programmes for dignity — never ratings or spectacle.",
    responsibilityOrder: 2
  },
  {
    id: "community-respect",
    roleId: "community-steward",
    title: "Community respect",
    description: "Steward community programmes with local dignity first.",
    responsibilityOrder: 3
  },
  {
    id: "research-ethics",
    roleId: "research-steward",
    title: "Research ethics",
    description: "Guard House Institute data pipeline anonymity — aggregate only.",
    responsibilityOrder: 4
  },
  {
    id: "faith-dignity",
    roleId: "faith-steward",
    title: "Faith dignity",
    description: "Ensure faith is held with respect — never pressure or performance.",
    responsibilityOrder: 5
  },
  {
    id: "legacy-preservation",
    roleId: "legacy-steward",
    title: "Legacy preservation",
    description: "Protect legacy families, archives, and Hall of Legacy architecture.",
    responsibilityOrder: 6
  },
  {
    id: "diaspora-corridors",
    roleId: "diaspora-steward",
    title: "Diaspora corridors",
    description: "Steward corridor-level aggregates — never personal identifiers.",
    responsibilityOrder: 7
  },
  {
    id: "institution-alignment",
    roleId: "institution-steward",
    title: "Institution alignment",
    description: "Align House, Institute, Observatory, and Governance Framework stewardship.",
    responsibilityOrder: 8
  }
];

export const STEWARDSHIP_OATH_COPY =
  "We steward BamSignal as custodians — serving the mission, protecting families, preserving trust, guarding legacy, and thinking in generations.";

export const STEWARDSHIP_COUNCIL_FUTURE_MODULES = [
  {
    id: "council-sessions",
    label: "Council sessions",
    description: "Scheduled council deliberations — documented, not implemented."
  },
  {
    id: "annual-reviews",
    label: "Annual reviews",
    description: "Yearly stewardship reviews — architecture reserved."
  },
  {
    id: "institution-oversight",
    label: "Institution oversight",
    description: "Cross-institution oversight workflow — not enabled yet."
  }
] as const;

export function getCouncilRole(roleId: CouncilRoleId): CouncilRoleDefinition | undefined {
  return COUNCIL_ROLES.find((role) => role.id === roleId);
}
