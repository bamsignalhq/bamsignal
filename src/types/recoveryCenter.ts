import type {
  BackupCategoryId,
  BackupStatusId,
  IncidentPlaybookId,
  IncidentRecoveryStatusId,
  RecoveryCenterAreaId,
  RecoveryLevelId,
  RecoveryModeId,
  RecoveryPlanStatusId,
  RestoreStatusId
} from "../constants/recoveryCenter";

export type BackupRecord = {
  id: string;
  backupRef: string;
  categoryId: BackupCategoryId;
  status: BackupStatusId;
  lastBackupAt: string;
  frequencyLabel: string;
  retentionDays: number;
  verifiedAt: string | null;
  sizeLabel: string;
  nextScheduledAt: string;
};

/** @deprecated use BackupRecord */
export type BackupStatusRecord = BackupRecord & { areaId: BackupCategoryId };

export type RecoveryOperationRecord = {
  id: string;
  operationRef: string;
  modeId: RecoveryModeId;
  target: string;
  status: RestoreStatusId;
  initiatedAt: string;
  completedAt?: string;
  initiatedBy: string;
  checklistComplete: boolean;
};

export type PlaybookRecord = {
  id: string;
  playbookRef: string;
  playbookId: IncidentPlaybookId;
  title: string;
  owner: string;
  status: RecoveryPlanStatusId;
  rtoMinutes: number;
  rpoMinutes: number;
  lastTestedAt: string | null;
  steps: string[];
};

export type RestoreHistoryRecord = {
  id: string;
  restoreRef: string;
  modeId: RecoveryModeId;
  categoryId: BackupCategoryId;
  status: RestoreStatusId;
  startedAt: string;
  completedAt?: string;
  verifiedAt?: string;
  initiatedBy: string;
  notes?: string;
};

export type RecoveryTestRecord = {
  id: string;
  testRef: string;
  playbookId: IncidentPlaybookId;
  status: "passed" | "failed" | "scheduled";
  runAt: string;
  durationMinutes: number;
  notes?: string;
};

export type CriticalSystemRecord = {
  id: string;
  systemRef: string;
  name: string;
  tier: "tier-1" | "tier-2" | "tier-3";
  rtoMinutes: number;
  backupCategoryId: BackupCategoryId;
  lastVerifiedAt: string;
};

export type DependencyLinkRecord = {
  id: string;
  linkRef: string;
  upstream: string;
  downstream: string;
  critical: boolean;
  failoverAvailable: boolean;
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

export type RecoveryPlanRecord = PlaybookRecord & { levelId?: RecoveryLevelId };

export type RecoveryFilterState = {
  query: string;
  areaId: BackupCategoryId | "all";
  levelId: RecoveryLevelId | "all";
};

export type RecoveryHealthSummary = {
  score: number;
  label: string;
  healthyBackups: number;
  totalBackups: number;
  testedPlaybooks: number;
  totalPlaybooks: number;
  activeRestores: number;
  verifiedRestores: number;
};

/** @deprecated use RecoveryHealthSummary */
export type RecoveryReadinessSummary = RecoveryHealthSummary & {
  testedPlans: number;
  totalPlans: number;
  activeIncidents: number;
};

export type RecoveryCenterBundle = {
  generatedAt: string;
  summary: RecoveryHealthSummary;
  backups: BackupRecord[];
  operations: RecoveryOperationRecord[];
  playbooks: PlaybookRecord[];
  restoreHistory: RestoreHistoryRecord[];
  recoveryTests: RecoveryTestRecord[];
  criticalSystems: CriticalSystemRecord[];
  dependencies: DependencyLinkRecord[];
  incidents: IncidentRecoveryRecord[];
};

export type RecoveryCenterAreaBundle = RecoveryCenterBundle & {
  areaId: RecoveryCenterAreaId;
};
