import type { ConsultantCrmSectionId } from "../constants/consultantCrm";
import type { RegionalTeamId } from "../constants/regionalConsultantTeams";
import type { RegionalTeamMetrics } from "./regionalConsultantTeams";

export type ConsultantCrmPipelineStage = {
  id: string;
  label: string;
  count: number;
  hint: string;
};

export type ConsultantCrmTask = {
  id: string;
  memberId: string;
  memberName: string;
  title: string;
  dueAt: string;
  overdue: boolean;
  type: string;
};

export type ConsultantCrmAgendaItem = {
  id: string;
  memberId?: string;
  memberName: string;
  scheduledAt: string;
  channel: string;
  notes?: string;
};

export type ConsultantCrmActivityItem = {
  id: string;
  at: string;
  label: string;
  detail?: string;
};

export type ConsultantCrmSectionRow = {
  id: string;
  primary: string;
  secondary: string;
  meta?: string;
};

export type ConsultantCrmRegionalTeam = {
  regionId: RegionalTeamId;
  regionLabel: string;
  directorName?: string;
  teamSize: number;
  metrics: RegionalTeamMetrics;
};

export type ConsultantCrmBundle = {
  pipeline: ConsultantCrmPipelineStage[];
  tasks: ConsultantCrmTask[];
  agenda: ConsultantCrmAgendaItem[];
  activity: ConsultantCrmActivityItem[];
  sectionCounts: Record<ConsultantCrmSectionId, number>;
  sectionRows: Record<ConsultantCrmSectionId, ConsultantCrmSectionRow[]>;
  regionalTeam?: ConsultantCrmRegionalTeam;
};
