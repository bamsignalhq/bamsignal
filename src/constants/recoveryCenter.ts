/** Business Continuity & Disaster Recovery Center™ — institutional resilience layer. */

import { RECOVERY_CENTER_ADMIN_BRAND } from "./recoveryCenterAdmin";

export const RECOVERY_CENTER_BRAND = RECOVERY_CENTER_ADMIN_BRAND;

export const RECOVERY_CENTER_AREAS = [
  { id: "backups", label: "Backups" },
  { id: "restore", label: "Restore" },
  { id: "recovery-plans", label: "Recovery Plans" },
  { id: "recovery-testing", label: "Recovery Testing" },
  { id: "incident-playbooks", label: "Incident Playbooks" },
  { id: "critical-systems", label: "Critical Systems" },
  { id: "dependencies", label: "Dependencies" },
  { id: "recovery-history", label: "Recovery History" }
] as const;

export type RecoveryCenterAreaId = (typeof RECOVERY_CENTER_AREAS)[number]["id"];

export const BACKUP_CATEGORIES = [
  { id: "database", label: "Database" },
  { id: "storage", label: "Storage" },
  { id: "documents", label: "Documents" },
  { id: "configurations", label: "Configurations" },
  { id: "audit-logs", label: "Audit Logs" },
  { id: "secrets-inventory", label: "Secrets Inventory" }
] as const;

export type BackupCategoryId = (typeof BACKUP_CATEGORIES)[number]["id"];

export const BACKUP_CATEGORY_LABELS: Record<BackupCategoryId, string> = Object.fromEntries(
  BACKUP_CATEGORIES.map((item) => [item.id, item.label])
) as Record<BackupCategoryId, string>;

export const RECOVERY_MODES = [
  { id: "point-in-time-restore", label: "Point-in-Time Restore" },
  { id: "full-restore", label: "Full Restore" },
  { id: "partial-restore", label: "Partial Restore" },
  { id: "verification", label: "Verification" },
  { id: "recovery-checklist", label: "Recovery Checklist" }
] as const;

export type RecoveryModeId = (typeof RECOVERY_MODES)[number]["id"];

export const INCIDENT_PLAYBOOKS = [
  { id: "database-failure", label: "Database Failure" },
  { id: "payment-failure", label: "Payment Failure" },
  { id: "email-failure", label: "Email Failure" },
  { id: "whatsapp-failure", label: "WhatsApp Failure" },
  { id: "supabase-failure", label: "Supabase Failure" },
  { id: "operations-failure", label: "Operations Failure" },
  { id: "security-incident", label: "Security Incident" }
] as const;

export type IncidentPlaybookId = (typeof INCIDENT_PLAYBOOKS)[number]["id"];

export const PLAYBOOK_LABELS: Record<IncidentPlaybookId, string> = Object.fromEntries(
  INCIDENT_PLAYBOOKS.map((item) => [item.id, item.label])
) as Record<IncidentPlaybookId, string>;

export const BACKUP_STATUSES = ["healthy", "warning", "failed", "pending"] as const;
export type BackupStatusId = (typeof BACKUP_STATUSES)[number];

export const BACKUP_STATUS_LABELS: Record<BackupStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  failed: "Failed",
  pending: "Pending"
};

export const RESTORE_STATUSES = ["completed", "in-progress", "failed", "verified"] as const;
export type RestoreStatusId = (typeof RESTORE_STATUSES)[number];

export const RESTORE_STATUS_LABELS: Record<RestoreStatusId, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  failed: "Failed",
  verified: "Verified"
};

export const RECOVERY_CENTER_DB_TABLES = [
  "recovery_backup_records",
  "recovery_restore_history",
  "recovery_playbook_records",
  "recovery_test_runs",
  "recovery_critical_systems",
  "recovery_dependency_links"
] as const;

export const RECOVERY_CENTER_AUDIT_ACTIONS = [
  "backup-verified",
  "restore-initiated",
  "restore-completed",
  "playbook-activated",
  "recovery-test-run",
  "dependency-updated"
] as const;

export type RecoveryCenterAuditActionId = (typeof RECOVERY_CENTER_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const RECOVERY_CENTER_FUTURE_ARCHITECTURE = [
  { id: "multi-region", label: "Multi-region" },
  { id: "automatic-failover", label: "Automatic Failover" },
  { id: "cold-standby", label: "Cold Standby" },
  { id: "hot-standby", label: "Hot Standby" },
  { id: "chaos-testing", label: "Chaos Testing" }
] as const;

/** @deprecated use BACKUP_CATEGORIES */
export type BackupAreaId = BackupCategoryId;

/** @deprecated use BACKUP_CATEGORIES */
export const BACKUP_AREAS = BACKUP_CATEGORIES.map((item) => ({
  id: item.id as BackupAreaId,
  label: item.label,
  hint: `${item.label} backup and retention policy.`
}));

export const BACKUP_AREA_LABELS = BACKUP_CATEGORY_LABELS;

export type RecoveryLevelId =
  | "minor-incident"
  | "major-incident"
  | "critical-incident"
  | "disaster-recovery";

export const RECOVERY_LEVELS = [
  { id: "minor-incident" as const, label: "Minor Incident", hint: "Single-service degradation." },
  { id: "major-incident" as const, label: "Major Incident", hint: "Multi-service outage." },
  { id: "critical-incident" as const, label: "Critical Incident", hint: "Data or payment path at risk." },
  { id: "disaster-recovery" as const, label: "Disaster Recovery", hint: "Full institution failover." }
];

export const RECOVERY_LEVEL_LABELS: Record<RecoveryLevelId, string> = Object.fromEntries(
  RECOVERY_LEVELS.map((item) => [item.id, item.label])
) as Record<RecoveryLevelId, string>;

export type RecoveryPlanStatusId = "ready" | "draft" | "tested" | "expired";

export const RECOVERY_PLAN_STATUS_LABELS: Record<RecoveryPlanStatusId, string> = {
  ready: "Ready",
  draft: "Draft",
  tested: "Tested",
  expired: "Expired"
};

export type IncidentRecoveryStatusId = "active" | "recovering" | "recovered" | "closed";

export const INCIDENT_RECOVERY_STATUS_LABELS: Record<IncidentRecoveryStatusId, string> = {
  active: "Active",
  recovering: "Recovering",
  recovered: "Recovered",
  closed: "Closed"
};
