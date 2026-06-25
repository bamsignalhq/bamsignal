import type {
  BackupAreaId,
  ContinuityExerciseStatusId,
  ContinuityHealthStatusId,
  IncidentSeverityId,
  IncidentStatusId,
  MonitoredProviderId,
  RecoveryPlaybookDomainId
} from "../constants/businessContinuity";

export type IncidentTimelineEntry = {
  at: string;
  actor: string;
  note: string;
};

export type IncidentReportRecord = {
  id: string;
  incidentRef: string;
  title: string;
  severity: IncidentSeverityId;
  status: IncidentStatusId;
  ownerEmail: string;
  affectedSystems: string[];
  timeline: IncidentTimelineEntry[];
  resolution?: string;
  postmortem?: string;
  startedAt: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type RecoveryPlaybookStep = {
  order: number;
  title: string;
  detail: string;
};

export type RecoveryPlanRecord = {
  id: string;
  slug: string;
  title: string;
  domainId: RecoveryPlaybookDomainId;
  status: "ready" | "draft" | "tested" | "expired";
  procedureSteps: RecoveryPlaybookStep[];
  ownerEmail?: string;
  lastTestedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BackupJobRecord = {
  id: string;
  jobRef: string;
  areaId: BackupAreaId;
  status: "pending" | "running" | "completed" | "failed";
  health: ContinuityHealthStatusId;
  durationSeconds?: number;
  verified: boolean;
  restorePoint?: string;
  frequency: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SystemHealthSnapshotRecord = {
  id: string;
  snapshotAt: string;
  overallStatus: ContinuityHealthStatusId;
  services: { providerId: MonitoredProviderId; status: ContinuityHealthStatusId }[];
  dependencies: Record<string, string>;
  createdAt: string;
};

export type ProviderStatusRecord = {
  id: string;
  providerId: MonitoredProviderId;
  status: ContinuityHealthStatusId;
  latencyMs?: number;
  lastCheckedAt: string;
  detail?: string;
};

export type ContinuityExerciseRecord = {
  id: string;
  exerciseRef: string;
  title: string;
  scenarioId: RecoveryPlaybookDomainId;
  status: ContinuityExerciseStatusId;
  scheduledAt: string;
  completedAt?: string;
  findings: string[];
  createdAt: string;
  updatedAt: string;
};

export type ContinuityOverviewMetric = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  tone?: ContinuityHealthStatusId;
};

export type RiskAssessmentItem = {
  id: string;
  label: string;
  score: number;
  status: ContinuityHealthStatusId;
  note: string;
};

export type BusinessContinuityBundle = {
  generatedAt: string;
  overviewMetrics: ContinuityOverviewMetric[];
  incidents: IncidentReportRecord[];
  providerStatuses: ProviderStatusRecord[];
  recoveryPlans: RecoveryPlanRecord[];
  backupJobs: BackupJobRecord[];
  exercises: ContinuityExerciseRecord[];
  latestSnapshot?: SystemHealthSnapshotRecord;
  riskAssessment: RiskAssessmentItem[];
  overallStatus: ContinuityHealthStatusId;
};
