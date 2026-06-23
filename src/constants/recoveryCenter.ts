/** Institutional Backup & Recovery Center™ — resilience architecture. */

export const RECOVERY_CENTER_BRAND = "Institutional Backup & Recovery Center™";

export type BackupAreaId =
  | "database-backups"
  | "document-backups"
  | "audit-backups"
  | "archive-backups"
  | "configuration-backups";

export type RecoveryLevelId =
  | "minor-incident"
  | "major-incident"
  | "critical-incident"
  | "disaster-recovery";

export type BackupStatusId = "healthy" | "warning" | "failed" | "pending";

export type RecoveryPlanStatusId = "ready" | "draft" | "tested" | "expired";

export type IncidentRecoveryStatusId = "active" | "recovering" | "recovered" | "closed";

export type RecoveryMetricId =
  | "last-backup"
  | "backup-frequency"
  | "recovery-readiness"
  | "retention-status";

export const BACKUP_AREAS: {
  id: BackupAreaId;
  label: string;
  hint: string;
}[] = [
  { id: "database-backups", label: "Database Backups", hint: "Postgres snapshots and point-in-time recovery." },
  { id: "document-backups", label: "Document Backups", hint: "Document Center and institutional knowledge exports." },
  { id: "audit-backups", label: "Audit Backups", hint: "Immutable audit trails and compliance exports." },
  { id: "archive-backups", label: "Archive Backups", hint: "Concierge journey archives and legacy indexes." },
  { id: "configuration-backups", label: "Configuration Backups", hint: "Runtime config, env manifests, and routing tables." }
];

export const BACKUP_AREA_LABELS: Record<BackupAreaId, string> = Object.fromEntries(
  BACKUP_AREAS.map((item) => [item.id, item.label])
) as Record<BackupAreaId, string>;

export const RECOVERY_LEVELS: {
  id: RecoveryLevelId;
  label: string;
  hint: string;
}[] = [
  { id: "minor-incident", label: "Minor Incident", hint: "Single-service degradation with local rollback." },
  { id: "major-incident", label: "Major Incident", hint: "Multi-service outage requiring coordinated recovery." },
  { id: "critical-incident", label: "Critical Incident", hint: "Data integrity or payment path at risk." },
  { id: "disaster-recovery", label: "Disaster Recovery", hint: "Full institution failover and cold restore." }
];

export const RECOVERY_LEVEL_LABELS: Record<RecoveryLevelId, string> = Object.fromEntries(
  RECOVERY_LEVELS.map((item) => [item.id, item.label])
) as Record<RecoveryLevelId, string>;

export const BACKUP_STATUS_LABELS: Record<BackupStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  failed: "Failed",
  pending: "Pending"
};

export const RECOVERY_PLAN_STATUS_LABELS: Record<RecoveryPlanStatusId, string> = {
  ready: "Ready",
  draft: "Draft",
  tested: "Tested",
  expired: "Expired"
};

export const INCIDENT_RECOVERY_STATUS_LABELS: Record<IncidentRecoveryStatusId, string> = {
  active: "Active",
  recovering: "Recovering",
  recovered: "Recovered",
  closed: "Closed"
};

export const RECOVERY_CENTER_METRICS: {
  id: RecoveryMetricId;
  label: string;
}[] = [
  { id: "last-backup", label: "Last Backup" },
  { id: "backup-frequency", label: "Backup Frequency" },
  { id: "recovery-readiness", label: "Recovery Readiness" },
  { id: "retention-status", label: "Retention Status" }
];

export const RECOVERY_CENTER_POLICIES = [
  { id: "backup-verification", label: "Backup Verification" },
  { id: "recovery-testing", label: "Recovery Testing" },
  { id: "data-retention", label: "Data Retention" },
  { id: "disaster-procedures", label: "Disaster Procedures" }
] as const;

/**
 * Future-ready recovery capabilities — documented only, not implemented.
 */
export const RECOVERY_CENTER_FUTURE_KINDS = [
  { id: "cross-region-recovery", label: "Cross region recovery" },
  { id: "automated-failover", label: "Automated failover" },
  { id: "cold-storage-archives", label: "Cold storage archives" }
] as const;
