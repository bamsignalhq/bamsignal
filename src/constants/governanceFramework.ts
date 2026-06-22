/** BamSignal Governance Framework™ — institutional stewardship architecture. */

import { UNDERSTANDING_RELATIONSHIPS_LABEL } from "./bamSignalInstitute";

export const GOVERNANCE_FRAMEWORK_TITLE = "BamSignal Governance Framework™";
export const GOVERNANCE_FRAMEWORK_LABEL = "Governance";
export const STEWARDSHIP_LABEL = "Stewardship";
export const INSTITUTION_COMMITMENT_LABEL = "Institution Commitment";

export const GOVERNANCE_FRAMEWORK_SUBCOPY =
  "BamSignal Governance Framework™ — stewardship pillars for mission, family, trust, community, legacy, research, and institution.";
export const GOVERNANCE_FRAMEWORK_PURPOSE_COPY =
  "Build governance architecture — companies can operate without it; institutions cannot. Documented only, not permissions or voting.";
export const GOVERNANCE_FRAMEWORK_RESERVED_COPY =
  "Architecture prepared. Governance council, policy reviews, and stewardship reports are not enabled yet.";

export { UNDERSTANDING_RELATIONSHIPS_LABEL };

export type GovernancePillarId =
  | "mission-stewardship"
  | "family-stewardship"
  | "trust-stewardship"
  | "community-stewardship"
  | "legacy-stewardship"
  | "research-stewardship"
  | "institution-stewardship";

export type GovernancePillarDefinition = {
  id: GovernancePillarId;
  title: string;
  description: string;
  pillarOrder: number;
};

export const GOVERNANCE_PILLARS: GovernancePillarDefinition[] = [
  {
    id: "mission-stewardship",
    title: "Mission Stewardship",
    description: "Guard the purpose of BamSignal — dignified relationship discovery, never exploitation.",
    pillarOrder: 1
  },
  {
    id: "family-stewardship",
    title: "Family Stewardship",
    description: "Families honoured at the centre — stewardship over spectacle.",
    pillarOrder: 2
  },
  {
    id: "trust-stewardship",
    title: "Trust Stewardship",
    description: "Trust earned through consistency, safety, and human review — never theatre.",
    pillarOrder: 3
  },
  {
    id: "community-stewardship",
    title: "Community Stewardship",
    description: "Communities strengthened with local dignity — not engagement metrics.",
    pillarOrder: 4
  },
  {
    id: "legacy-stewardship",
    title: "Legacy Stewardship",
    description: "Legacy families and generations protected — long horizon, not quarterly wins.",
    pillarOrder: 5
  },
  {
    id: "research-stewardship",
    title: "Research Stewardship",
    description: "Research through House Institute — anonymous aggregates, never member identities.",
    pillarOrder: 6
  },
  {
    id: "institution-stewardship",
    title: "Institution Stewardship",
    description: "The BamSignal House™, Institute, Observatory, and Index stewarded as one institution.",
    pillarOrder: 7
  }
];

export type StewardshipPrincipleId =
  | "protect-mission"
  | "protect-families"
  | "protect-trust"
  | "protect-community"
  | "protect-legacy"
  | "protect-future-generations";

export type StewardshipPrincipleDefinition = {
  id: StewardshipPrincipleId;
  title: string;
  description: string;
  principleOrder: number;
};

export const STEWARDSHIP_PRINCIPLES: StewardshipPrincipleDefinition[] = [
  {
    id: "protect-mission",
    title: "Protect the mission",
    description: "Every product and operation serves dignified relationship discovery.",
    principleOrder: 1
  },
  {
    id: "protect-families",
    title: "Protect families",
    description: "Family outcomes matter more than growth charts.",
    principleOrder: 2
  },
  {
    id: "protect-trust",
    title: "Protect trust",
    description: "Trust is institutional capital — guarded in every decision.",
    principleOrder: 3
  },
  {
    id: "protect-community",
    title: "Protect community",
    description: "Communities are partners, not audiences.",
    principleOrder: 4
  },
  {
    id: "protect-legacy",
    title: "Protect legacy",
    description: "Legacy is measured in generations, not quarters.",
    principleOrder: 5
  },
  {
    id: "protect-future-generations",
    title: "Protect future generations",
    description: "Stewardship extends beyond the founders — architecture for the century ahead.",
    principleOrder: 6
  }
];

export type GovernanceTimelineEntry = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export const GOVERNANCE_TIMELINE_ENTRIES: GovernanceTimelineEntry[] = [
  {
    id: "govf_timeline_framework_prepared",
    label: "Governance framework architecture prepared",
    recordedAt: "2026-01-15T00:00:00.000Z",
    note: "Seven stewardship pillars documented — not council or voting."
  },
  {
    id: "govf_timeline_principles_defined",
    label: "Core stewardship principles defined",
    recordedAt: "2026-03-01T00:00:00.000Z",
    note: "Mission, family, trust, community, legacy, and future generations."
  },
  {
    id: "govf_timeline_commitments_reserved",
    label: "Institution commitments pathway reserved",
    recordedAt: "2026-05-01T00:00:00.000Z",
    note: "Annual stewardship reports documented for future readiness only."
  }
];

export type InstitutionCommitmentId =
  | "mission-integrity"
  | "family-dignity"
  | "trust-accountability"
  | "community-stewardship"
  | "legacy-preservation"
  | "research-ethics";

export type InstitutionCommitmentDefinition = {
  id: InstitutionCommitmentId;
  title: string;
  description: string;
  commitmentOrder: number;
};

export const INSTITUTION_COMMITMENTS: InstitutionCommitmentDefinition[] = [
  {
    id: "mission-integrity",
    title: "Mission integrity",
    description: "BamSignal will not trade mission for metrics — architecture documented, not legal policy.",
    commitmentOrder: 1
  },
  {
    id: "family-dignity",
    title: "Family dignity",
    description: "Families are never reduced to data points in institutional research or marketing.",
    commitmentOrder: 2
  },
  {
    id: "trust-accountability",
    title: "Trust accountability",
    description: "Trust stewardship spans products, consultants, and House programmes.",
    commitmentOrder: 3
  },
  {
    id: "community-stewardship",
    title: "Community stewardship",
    description: "Communities grow through dignity — not extraction or leaderboard culture.",
    commitmentOrder: 4
  },
  {
    id: "legacy-preservation",
    title: "Legacy preservation",
    description: "Legacy families and archives protected for future generations.",
    commitmentOrder: 5
  },
  {
    id: "research-ethics",
    title: "Research ethics",
    description: "House Institute research remains anonymous and aggregate — never identities.",
    commitmentOrder: 6
  }
];

export const GOVERNANCE_FUTURE_MODULES = [
  {
    id: "council-approvals",
    label: "Council approvals",
    description: "Governance council review workflow — documented, not implemented."
  },
  {
    id: "policy-reviews",
    label: "Policy reviews",
    description: "Institutional policy review cycles — architecture reserved."
  },
  {
    id: "annual-stewardship-reports",
    label: "Annual stewardship reports",
    description: "Yearly stewardship publications — not enabled yet."
  }
] as const;

export function getGovernancePillar(
  pillarId: GovernancePillarId
): GovernancePillarDefinition | undefined {
  return GOVERNANCE_PILLARS.find((pillar) => pillar.id === pillarId);
}
