import type {
  BackupAreaId,
  BackupStatusId,
  IncidentRecoveryStatusId,
  RecoveryLevelId,
  RecoveryMetricId,
  RecoveryPlanStatusId
} from "../constants/recoveryCenter";

export type BackupStatusRecord = {
  id: string;
  areaId: BackupAreaId;
  status: BackupStatusId;
  lastBackupAt: string;
  frequencyLabel: string;
  retentionDays: number;
  verifiedAt: string | null;
  sizeLabel: string;
  nextScheduledAt: string;
};

export type RecoveryPlanRecord = {
  id: string;
  levelId: RecoveryLevelId;
  title: string;
  owner: string;
  status: RecoveryPlanStatusId;
  rtoMinutes: number;
  rpoMinutes: number;
  lastTestedAt: string | null;
  steps: string[];
};

export type RecoveryTimelineEntry = {
  id: string;
  phase: string;
  actor: string;
  timestamp: string;
  note: string;
};

export type IncidentRecoveryRecord = {
  id: string;
  incidentRef: string;
  levelId: RecoveryLevelId;
  title: string;
  status: IncidentRecoveryStatusId;
  startedAt: string;
  resolvedAt: string | null;
  owner: string;
  summary: string;
  timeline: RecoveryTimelineEntry[];
};

export type RecoveryFilterState = {
  query: string;
  areaId: BackupAreaId | "all";
  levelId: RecoveryLevelId | "all";
};

export type RecoveryMetric = {
  id: RecoveryMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type RecoveryReadinessSummary = {
  score: number;
  label: string;
  healthyBackups: number;
  totalBackups: number;
  testedPlans: number;
  totalPlans: number;
  activeIncidents: number;
};

export type RecoveryCenterBundle = {
  generatedAt: string;
  metrics: RecoveryMetric[];
  backups: BackupStatusRecord[];
  plans: RecoveryPlanRecord[];
  incidents: IncidentRecoveryRecord[];
  readiness: RecoveryReadinessSummary;
  selectedIncident: IncidentRecoveryRecord | null;
};
