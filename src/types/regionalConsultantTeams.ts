import type { RegionalTeamId, RegionalTeamRoleId } from "../constants/regionalConsultantTeams";

export type RegionalTeamMember = {
  consultantId: string;
  name: string;
  email: string;
  status: string;
  teamRole: RegionalTeamRoleId;
  isDirector: boolean;
};

export type RegionalTeamDirector = {
  consultantId: string;
  name: string;
  email: string;
  regionLabel: string;
  teamRole: RegionalTeamRoleId;
  stewardCount: number;
  narrative: string;
};

/** @deprecated Use RegionalTeamDirector */
export type RegionalTeamLead = RegionalTeamDirector;

export type RegionalTeamMetrics = {
  members: number;
  consultants: number;
  introductions: number;
  relationships: number;
  engagements: number;
  marriages: number;
  legacyFamilies: number;
};

export type RegionalTeamWorkloadRow = {
  consultantId: string;
  name: string;
  roleLabel: string;
  activeMembers: number;
  openIntroductions: number;
  health: string;
  summary: string;
};

export type RegionalCoverageRow = {
  id: string;
  label: string;
  memberCount: number;
};

export type RegionalAssignmentRow = {
  id: string;
  memberName: string;
  journeyId?: string;
  status: string;
  city: string;
  recommendedConsultant?: string;
  detail: string;
};

export type RegionalTeamSnapshot = {
  regionId: RegionalTeamId;
  regionLabel: string;
  timezone: string;
  director: RegionalTeamDirector | null;
  consultants: RegionalTeamMember[];
  metrics: RegionalTeamMetrics;
  workload: RegionalTeamWorkloadRow[];
  coverage: RegionalCoverageRow[];
  assignments: RegionalAssignmentRow[];
};

export type RegionalConsultantTeamsBundle = {
  teams: RegionalTeamSnapshot[];
  updatedAt: string;
};
