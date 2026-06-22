import type { CouncilRoleId, StewardshipCouncilPrincipleId } from "../constants/stewardshipCouncil";

export type CouncilRoleCardViewModel = {
  id: CouncilRoleId;
  title: string;
  description: string;
  roleOrder: number;
  roleLabel: string;
  statusLabel: string;
};

export type CouncilMemberCardViewModel = {
  id: string;
  roleId: CouncilRoleId;
  roleTitle: string;
  seatLabel: string;
  stewardshipNote: string;
  statusLabel: string;
};

export type CouncilTimelineEntryViewModel = {
  id: string;
  label: string;
  recordedAt: string;
  note?: string;
};

export type StewardshipOathCardViewModel = {
  oathCopy: string;
  principles: Array<{
    id: StewardshipCouncilPrincipleId;
    title: string;
    description: string;
    principleOrder: number;
  }>;
};

export type CouncilResponsibilityCardViewModel = {
  id: string;
  roleId: CouncilRoleId;
  roleTitle: string;
  title: string;
  description: string;
  responsibilityOrder: number;
  statusLabel: string;
};

export type StewardshipCouncilBundle = {
  roles: CouncilRoleCardViewModel[];
  members: CouncilMemberCardViewModel[];
  timeline: CouncilTimelineEntryViewModel[];
  oath: StewardshipOathCardViewModel;
  responsibilities: CouncilResponsibilityCardViewModel[];
  roleCount: number;
};
