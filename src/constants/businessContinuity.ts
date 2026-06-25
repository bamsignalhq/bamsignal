/** Business Continuity & Disaster Recovery Center™ — institutional resilience layer. */

import { BUSINESS_CONTINUITY_ADMIN_BRAND } from "./businessContinuityAdmin";

export const BUSINESS_CONTINUITY_BRAND = BUSINESS_CONTINUITY_ADMIN_BRAND;

export const CONTINUITY_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "partial-outage",
  "major-outage",
  "maintenance"
] as const;

export type ContinuityHealthStatusId = (typeof CONTINUITY_HEALTH_STATUSES)[number];

export const CONTINUITY_HEALTH_STATUS_LABELS: Record<ContinuityHealthStatusId, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  "partial-outage": "Partial Outage",
  "major-outage": "Major Outage",
  maintenance: "Maintenance"
};

export const MONITORED_PROVIDER_IDS = [
  "supabase",
  "paystack",
  "google-calendar",
  "zoom",
  "google-meet",
  "resend",
  "sendchamp",
  "storage",
  "authentication",
  "cron-jobs"
] as const;

export type MonitoredProviderId = (typeof MONITORED_PROVIDER_IDS)[number];

export const MONITORED_PROVIDERS: {
  id: MonitoredProviderId;
  label: string;
  critical: boolean;
  category: string;
}[] = [
  { id: "supabase", label: "Supabase", critical: true, category: "Platform" },
  { id: "paystack", label: "Paystack", critical: true, category: "Payments" },
  { id: "google-calendar", label: "Google Calendar", critical: false, category: "Scheduling" },
  { id: "zoom", label: "Zoom", critical: false, category: "Meetings" },
  { id: "google-meet", label: "Google Meet", critical: false, category: "Meetings" },
  { id: "resend", label: "Resend", critical: true, category: "Messaging" },
  { id: "sendchamp", label: "Sendchamp", critical: false, category: "Messaging" },
  { id: "storage", label: "Storage", critical: true, category: "Platform" },
  { id: "authentication", label: "Authentication", critical: true, category: "Security" },
  { id: "cron-jobs", label: "Cron Jobs", critical: true, category: "Operations" }
];

export const MONITORED_PROVIDER_LABELS: Record<MonitoredProviderId, string> = Object.fromEntries(
  MONITORED_PROVIDERS.map((item) => [item.id, item.label])
) as Record<MonitoredProviderId, string>;

export const RECOVERY_PLAYBOOK_DOMAINS = [
  "database-outage",
  "payment-outage",
  "email-outage",
  "whatsapp-outage",
  "calendar-outage",
  "zoom-outage",
  "authentication-outage",
  "storage-outage",
  "server-outage",
  "dns-outage"
] as const;

export type RecoveryPlaybookDomainId = (typeof RECOVERY_PLAYBOOK_DOMAINS)[number];

export const RECOVERY_PLAYBOOK_DOMAIN_LABELS: Record<RecoveryPlaybookDomainId, string> = {
  "database-outage": "Database outage",
  "payment-outage": "Payment outage",
  "email-outage": "Email outage",
  "whatsapp-outage": "WhatsApp outage",
  "calendar-outage": "Calendar outage",
  "zoom-outage": "Zoom outage",
  "authentication-outage": "Authentication outage",
  "storage-outage": "Storage outage",
  "server-outage": "Server outage",
  "dns-outage": "DNS outage"
};

export const INCIDENT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type IncidentSeverityId = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverityId, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

export const INCIDENT_STATUSES = ["active", "investigating", "mitigating", "resolved", "closed"] as const;
export type IncidentStatusId = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatusId, string> = {
  active: "Active",
  investigating: "Investigating",
  mitigating: "Mitigating",
  resolved: "Resolved",
  closed: "Closed"
};

export const BACKUP_AREAS = [
  "database",
  "documents",
  "audit-trails",
  "configuration",
  "media-storage"
] as const;

export type BackupAreaId = (typeof BACKUP_AREAS)[number];

export const BACKUP_AREA_LABELS: Record<BackupAreaId, string> = {
  database: "Database",
  documents: "Documents",
  "audit-trails": "Audit trails",
  configuration: "Configuration",
  "media-storage": "Media storage"
};

export const CONTINUITY_EXERCISE_STATUSES = [
  "scheduled",
  "in-progress",
  "completed",
  "cancelled"
] as const;

export type ContinuityExerciseStatusId = (typeof CONTINUITY_EXERCISE_STATUSES)[number];

export const CONTINUITY_EXERCISE_STATUS_LABELS: Record<ContinuityExerciseStatusId, string> = {
  scheduled: "Scheduled",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const BUSINESS_CONTINUITY_DB_TABLES = [
  "incident_reports",
  "recovery_plans",
  "backup_jobs",
  "system_health_snapshots",
  "provider_status",
  "continuity_exercises"
] as const;

/** Future-ready architecture — documented only, not implemented. */
export const BUSINESS_CONTINUITY_FUTURE_ARCHITECTURE = [
  {
    id: "multi-region-failover",
    label: "Multi-region failover",
    description: "Automatic traffic shift to secondary region when primary region degrades."
  },
  {
    id: "read-replicas",
    label: "Read replicas",
    description: "Geographically distributed read replicas for query resilience during primary strain."
  },
  {
    id: "cold-standby",
    label: "Cold standby",
    description: "Minimal-cost dormant environment activated during declared disaster recovery."
  },
  {
    id: "hot-standby",
    label: "Hot standby",
    description: "Live mirrored stack with sub-minute promotion during critical incidents."
  },
  {
    id: "geo-redundancy",
    label: "Geo redundancy",
    description: "Cross-border data replication and jurisdictional failover planning."
  }
] as const;

export const BUSINESS_CONTINUITY_AUDIT_ACTIONS = [
  "incident-opened",
  "incident-updated",
  "incident-resolved",
  "playbook-reviewed",
  "exercise-scheduled",
  "backup-verified"
] as const;

export type BusinessContinuityAuditActionId = (typeof BUSINESS_CONTINUITY_AUDIT_ACTIONS)[number];
