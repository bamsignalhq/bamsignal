/** Security Operations Center — centralized platform security events (not moderation). */

import { SECURITY_OPERATIONS_CENTER_ADMIN_BRAND } from "./securityOperationsCenterAdmin";

export const SECURITY_OPERATIONS_CENTER_BRAND = SECURITY_OPERATIONS_CENTER_ADMIN_BRAND;

export const SECURITY_OPS_REFRESH_INTERVAL_MS = 30_000;

export const SECURITY_OPS_MODULES = [
  { id: "authentication", label: "Authentication" },
  { id: "suspicious-logins", label: "Suspicious logins" },
  { id: "permission-changes", label: "Permission changes" },
  { id: "privilege-escalation", label: "Privilege escalation" },
  { id: "api-abuse", label: "API abuse" },
  { id: "token-anomalies", label: "Token anomalies" },
  { id: "session-anomalies", label: "Session anomalies" },
  { id: "brute-force-attempts", label: "Brute-force attempts" },
  { id: "rate-limit-triggers", label: "Rate-limit triggers" },
  { id: "admin-activity", label: "Admin activity" }
] as const;

export type SecurityOpsModuleId = (typeof SECURITY_OPS_MODULES)[number]["id"];

export const SECURITY_OPS_MODULE_LABELS: Record<SecurityOpsModuleId, string> = Object.fromEntries(
  SECURITY_OPS_MODULES.map((item) => [item.id, item.label])
) as Record<SecurityOpsModuleId, string>;

export const SECURITY_OPS_SCORE_DOMAINS = [
  { id: "authentication", label: "Authentication" },
  { id: "authorization", label: "Authorization" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "payments", label: "Payments" },
  { id: "notifications", label: "Notifications" },
  { id: "storage", label: "Storage" },
  { id: "database", label: "Database" }
] as const;

export type SecurityOpsScoreId = (typeof SECURITY_OPS_SCORE_DOMAINS)[number]["id"];

export const SECURITY_OPS_TOOLS = [
  { id: "invalidate-sessions", label: "Invalidate sessions", hint: "Revoke active member sessions" },
  { id: "force-logout", label: "Force logout", hint: "Force logout on target account" },
  { id: "rotate-secrets", label: "Rotate secrets", hint: "Queue secret rotation workflow" },
  { id: "lock-account", label: "Lock account", hint: "Lock account pending investigation" },
  { id: "temporary-block", label: "Temporary block", hint: "Temporary IP or account block" },
  { id: "permanent-block", label: "Permanent block", hint: "Permanent block after confirmed abuse" }
] as const;

export type SecurityOpsToolId = (typeof SECURITY_OPS_TOOLS)[number]["id"];

export const SECURITY_INCIDENT_STATUSES = [
  "open",
  "investigating",
  "contained",
  "resolved"
] as const;

export type SecurityIncidentStatusId = (typeof SECURITY_INCIDENT_STATUSES)[number];

export const SECURITY_INCIDENT_STATUS_LABELS: Record<SecurityIncidentStatusId, string> = {
  open: "Open",
  investigating: "Investigating",
  contained: "Contained",
  resolved: "Resolved"
};

export type SecurityOpsHealthStatusId = "healthy" | "warning" | "critical";

export const SECURITY_OPS_HEALTH_LABELS: Record<SecurityOpsHealthStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical"
};

export const SECURITY_OPERATIONS_CENTER_DB_TABLES = [
  "security_ops_events",
  "security_ops_scores",
  "security_ops_incidents",
  "security_ops_actions",
  "security_ops_timeline"
] as const;
