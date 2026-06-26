import type {
  DisasterBackupMonitorId,
  DisasterBackupStatusId,
  DisasterPlanId,
  DisasterRecoveryOperationId,
  DisasterReportMetricId
} from "../constants/disasterRecovery";

export type DisasterBackupMonitorRecord = {
  id: DisasterBackupMonitorId;
  label: string;
  status: DisasterBackupStatusId;
  lastBackupAt: string;
  lastVerifiedAt: string | null;
  sizeLabel: string;
  retentionDays: number;
  frequencyLabel: string;
  nextScheduledAt: string;
  snapshotRef: string;
};

export type DisasterRecoveryOperationRecord = {
  id: string;
  operationId: DisasterRecoveryOperationId;
  label: string;
  target: string;
  status: "queued" | "running" | "completed" | "failed";
  initiatedBy: string;
  initiatedAt: string;
  completedAt?: string;
  detail?: string;
};

export type DisasterPlanRecord = {
  id: DisasterPlanId;
  label: string;
  status: "ready" | "draft" | "tested";
  rtoMinutes: number;
  rpoMinutes: number;
  owner: string;
  lastTestedAt: string | null;
  steps: string[];
};

export type DisasterReportMetric = {
  id: DisasterReportMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type DisasterRecoverySummary = {
  healthyMonitors: number;
  warningMonitors: number;
  failedMonitors: number;
  lastCheckedAt: string;
};

export type DisasterSnapshotComparison = {
  id: string;
  leftRef: string;
  rightRef: string;
  monitorId: DisasterBackupMonitorId;
  diffCount: number;
  comparedAt: string;
  summary: string;
};

export type BackupDisasterRecoveryCenterBundle = {
  generatedAt: string;
  summary: DisasterRecoverySummary;
  metrics: DisasterReportMetric[];
  monitors: DisasterBackupMonitorRecord[];
  operations: DisasterRecoveryOperationRecord[];
  plans: DisasterPlanRecord[];
  comparisons: DisasterSnapshotComparison[];
  recentOperations: DisasterRecoveryOperationRecord[];
};
