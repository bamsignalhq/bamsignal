import type { RegionalTeamId, RegionalTeamRoleId } from "../constants/regionalConsultantTeams";

export type RegionalTeamMember = {
  consultantId: string;
  name: string;
  email: string;
  status: string;
  teamRole: RegionalTeamRoleId;
  isLead: boolean;
};

export type RegionalTeamLead = {
  consultantId: string;
  name: string;
  email: string;
  regionLabel: string;
  teamRole: RegionalTeamRoleId;
  stewardCount: number;
  narrative: string;
};

export type RegionalTeamMetrics = {
  activeMembers: number;
  openApplications: number;
  consultations: number;
  introductions: number;
  relationships: number;
};

export type RegionalTeamSnapshot = {
  regionId: RegionalTeamId;
  regionLabel: string;
  timezone: string;
  lead: RegionalTeamLead | null;
  consultants: RegionalTeamMember[];
  metrics: RegionalTeamMetrics;
};

export type RegionalConsultantTeamsBundle = {
  teams: RegionalTeamSnapshot[];
  updatedAt: string;
};
