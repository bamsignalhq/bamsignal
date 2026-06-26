/** Backup & Disaster Recovery Center™ — operational playbook when anything fails. */

import { DISASTER_RECOVERY_ADMIN_BRAND } from "./disasterRecoveryAdmin";

export const DISASTER_RECOVERY_BRAND = DISASTER_RECOVERY_ADMIN_BRAND;

export const DISASTER_RECOVERY_REFRESH_INTERVAL_MS = 30_000;

export type DisasterBackupMonitorId =
  | "database-backups"
  | "storage-backups"
  | "configuration-backups"
  | "feature-flag-snapshots"
  | "remote-config-snapshots"
  | "release-snapshots";

export type DisasterRecoveryOperationId =
  | "run-backup"
  | "restore"
  | "verify-integrity"
  | "compare-snapshots"
  | "recovery-simulation";

export type DisasterPlanId =
  | "database-failure"
  | "storage-outage"
  | "provider-outage"
  | "payment-outage"
  | "notification-outage"
  | "complete-platform-outage";

export type DisasterReportMetricId =
  | "last-backup"
  | "recovery-duration"
  | "integrity"
  | "failures";

export type DisasterBackupStatusId = "healthy" | "warning" | "failed" | "pending";

export const DISASTER_BACKUP_MONITORS: { id: DisasterBackupMonitorId; label: string }[] = [
  { id: "database-backups", label: "Database backups" },
  { id: "storage-backups", label: "Storage backups" },
  { id: "configuration-backups", label: "Configuration backups" },
  { id: "feature-flag-snapshots", label: "Feature flag snapshots" },
  { id: "remote-config-snapshots", label: "Remote config snapshots" },
  { id: "release-snapshots", label: "Release snapshots" }
];

export const DISASTER_BACKUP_MONITOR_LABELS: Record<DisasterBackupMonitorId, string> =
  Object.fromEntries(DISASTER_BACKUP_MONITORS.map((item) => [item.id, item.label])) as Record<
    DisasterBackupMonitorId,
    string
  >;

export const DISASTER_RECOVERY_OPERATIONS: { id: DisasterRecoveryOperationId; label: string }[] = [
  { id: "run-backup", label: "Run backup" },
  { id: "restore", label: "Restore" },
  { id: "verify-integrity", label: "Verify integrity" },
  { id: "compare-snapshots", label: "Compare snapshots" },
  { id: "recovery-simulation", label: "Recovery simulation" }
];

export const DISASTER_RECOVERY_OPERATION_LABELS: Record<DisasterRecoveryOperationId, string> =
  Object.fromEntries(DISASTER_RECOVERY_OPERATIONS.map((item) => [item.id, item.label])) as Record<
    DisasterRecoveryOperationId,
    string
  >;

export const DISASTER_PLANS: { id: DisasterPlanId; label: string }[] = [
  { id: "database-failure", label: "Database failure" },
  { id: "storage-outage", label: "Storage outage" },
  { id: "provider-outage", label: "Provider outage" },
  { id: "payment-outage", label: "Payment outage" },
  { id: "notification-outage", label: "Notification outage" },
  { id: "complete-platform-outage", label: "Complete platform outage" }
];

export const DISASTER_PLAN_LABELS: Record<DisasterPlanId, string> = Object.fromEntries(
  DISASTER_PLANS.map((item) => [item.id, item.label])
) as Record<DisasterPlanId, string>;

export const DISASTER_REPORT_METRICS: { id: DisasterReportMetricId; label: string; hint: string }[] =
  [
    { id: "last-backup", label: "Last backup", hint: "Most recent successful backup across monitors." },
    { id: "recovery-duration", label: "Recovery duration", hint: "Mean recovery time from last simulations." },
    { id: "integrity", label: "Integrity", hint: "Verified backup integrity rate." },
    { id: "failures", label: "Failures", hint: "Failed backups or restores in the last 30 days." }
  ];

export const DISASTER_BACKUP_STATUS_LABELS: Record<DisasterBackupStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  failed: "Failed",
  pending: "Pending"
};

export const DISASTER_RECOVERY_DB_TABLES = [
  "disaster_backup_monitors",
  "disaster_recovery_operations",
  "disaster_recovery_plans",
  "disaster_recovery_reports"
] as const;
