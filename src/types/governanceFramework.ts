import type {
  GovernancePillarId,
  InstitutionCommitmentId,
  StewardshipPrincipleId
} from "../constants/governanceFramework";

export type GovernancePillarCardViewModel = {
  id: GovernancePillarId;
  title: string;
  description: string;
  pillarOrder: number;
  stewardshipLabel: string;
  statusLabel: string;
};

export type StewardshipPrincipleCardViewModel = {
  id: StewardshipPrincipleId;
  title: string;
  description: string;
  principleOrder: number;
  statusLabel: string;
};

export type GovernanceTimelineEntryViewModel = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type InstitutionCommitmentCardViewModel = {
  id: InstitutionCommitmentId;
  title: string;
  description: string;
  commitmentOrder: number;
  commitmentLabel: string;
  statusLabel: string;
};

export type GovernanceFrameworkBundle = {
  pillars: GovernancePillarCardViewModel[];
  principles: StewardshipPrincipleCardViewModel[];
  timeline: GovernanceTimelineEntryViewModel[];
  commitments: InstitutionCommitmentCardViewModel[];
  pillarCount: number;
};
