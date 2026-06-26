/** Institutional Readiness Audit — final institutional audit engine for the entire platform. */

import type {
  GoNoGoVerdictId,
  ReadinessAuditDomainId,
  ReadinessCheckTypeId,
  ReadinessSubsystemId
} from "../types/institutionalReadiness";
import { INSTITUTIONAL_READINESS_BRAND } from "./institutionalReadinessAdmin";

export const READINESS_VERIFICATION_BRAND = INSTITUTIONAL_READINESS_BRAND;

export const INSTITUTIONAL_READINESS_REFRESH_INTERVAL_MS = 30_000;

/** Founder audit domains — one place that evaluates the entire platform. */
export const READINESS_AUDIT_DOMAINS = [
  { id: "infrastructure", label: "Infrastructure" },
  { id: "security", label: "Security" },
  { id: "payments", label: "Payments" },
  { id: "messaging", label: "Messaging" },
  { id: "matching", label: "Matching" },
  { id: "concierge", label: "Concierge" },
  { id: "support", label: "Support" },
  { id: "operations", label: "Operations" },
  { id: "research", label: "Research" },
  { id: "communities", label: "Communities" },
  { id: "events", label: "Events" },
  { id: "documentation", label: "Documentation" },
  { id: "release", label: "Release" },
  { id: "backups", label: "Backups" },
  { id: "monitoring", label: "Monitoring" },
  { id: "abuse", label: "Abuse" },
  { id: "performance", label: "Performance" }
] as const;

export const READINESS_AUDIT_DOMAIN_LABELS: Record<ReadinessAuditDomainId, string> =
  Object.fromEntries(READINESS_AUDIT_DOMAINS.map((item) => [item.id, item.label])) as Record<
    ReadinessAuditDomainId,
    string
  >;

export const READINESS_EXPORT_TYPES = [
  { id: "founder-report", label: "Founder Report" },
  { id: "board-report", label: "Board Report" },
  { id: "launch-report", label: "Launch Report" }
] as const;

export type ReadinessExportTypeId = (typeof READINESS_EXPORT_TYPES)[number]["id"];

export const READINESS_BLOCKER_SEVERITIES = [
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" }
] as const;

export type ReadinessBlockerSeverityId = (typeof READINESS_BLOCKER_SEVERITIES)[number]["id"];

export const READINESS_BLOCKER_SEVERITY_LABELS: Record<ReadinessBlockerSeverityId, string> =
  Object.fromEntries(READINESS_BLOCKER_SEVERITIES.map((item) => [item.id, item.label])) as Record<
    ReadinessBlockerSeverityId,
    string
  >;

export const READINESS_SUBSYSTEMS = [
  { id: "routing", label: "Routing" },
  { id: "authentication", label: "Authentication" },
  { id: "permissions", label: "Permissions" },
  { id: "supabase", label: "Supabase" },
  { id: "payments", label: "Payments" },
  { id: "scheduling", label: "Scheduling" },
  { id: "notifications", label: "Notifications" },
  { id: "crm", label: "CRM" },
  { id: "operations", label: "Operations" },
  { id: "journey-engine", label: "Journey Engine" },
  { id: "introductions", label: "Introductions" },
  { id: "follow-ups", label: "Follow-ups" },
  { id: "archive", label: "Archive" },
  { id: "legacy", label: "Legacy" },
  { id: "monitoring", label: "Monitoring" },
  { id: "security", label: "Security" },
  { id: "compliance", label: "Compliance" },
  { id: "backups", label: "Backups" },
  { id: "executive-dashboard", label: "Executive Dashboard" }
] as const;

export const READINESS_SUBSYSTEM_LABELS: Record<ReadinessSubsystemId, string> =
  Object.fromEntries(READINESS_SUBSYSTEMS.map((item) => [item.id, item.label])) as Record<
    ReadinessSubsystemId,
    string
  >;

export const READINESS_RESULTS = [
  { id: "healthy", label: "Healthy" },
  { id: "warning", label: "Warning" },
  { id: "critical", label: "Critical" },
  { id: "unknown", label: "Unknown" }
] as const;

export type ReadinessResultId = (typeof READINESS_RESULTS)[number]["id"];

export const READINESS_RESULT_LABELS: Record<ReadinessResultId, string> =
  Object.fromEntries(READINESS_RESULTS.map((item) => [item.id, item.label])) as Record<
    ReadinessResultId,
    string
  >;

export const READINESS_CHECK_TYPES = [
  { id: "configuration", label: "Configuration" },
  { id: "connectivity", label: "Connectivity" },
  { id: "data-integrity", label: "Data Integrity" },
  { id: "performance", label: "Performance" },
  { id: "permissions", label: "Permissions" },
  { id: "dependencies", label: "Dependencies" },
  { id: "audit-coverage", label: "Audit Coverage" },
  { id: "operational-status", label: "Operational Status" }
] as const;

export const READINESS_CHECK_TYPE_LABELS: Record<ReadinessCheckTypeId, string> =
  Object.fromEntries(READINESS_CHECK_TYPES.map((item) => [item.id, item.label])) as Record<
    ReadinessCheckTypeId,
    string
  >;

export const READINESS_VERIFICATION_RULES = [
  "Every subsystem must expose a readiness contract.",
  "Every failed dependency must surface upstream.",
  "No subsystem may report Ready if critical dependencies are failing."
] as const;

export const READINESS_FUTURE_ARCHITECTURE = [
  { id: "continuous-verification", label: "Continuous Verification" },
  { id: "pre-deployment-verification", label: "Pre-deployment Verification" },
  { id: "release-gates", label: "Release Gates" },
  { id: "automatic-rollback-decisions", label: "Automatic Rollback Decisions" }
] as const;

export const GO_NO_GO_LABELS: Record<GoNoGoVerdictId, string> = {
  go: "GO",
  "go-with-conditions": "GO WITH CONDITIONS",
  "no-go": "NO GO"
};

export const READINESS_VERIFICATION_DB_TABLES = [
  "readiness_subsystem_contracts",
  "readiness_verification_checks",
  "readiness_dependency_links",
  "readiness_critical_issues",
  "readiness_verification_runs",
  "readiness_snapshots",
  "readiness_audit_domains",
  "readiness_trend_snapshots",
  "readiness_audit_exports"
] as const;

export const READINESS_AUDIT_ACTIONS = [
  "verification-run",
  "subsystem-checked",
  "dependency-surfaced",
  "go-no-go-updated",
  "audit-domain-scored",
  "report-exported",
  "trend-recorded"
] as const;

export type ReadinessAuditActionId = (typeof READINESS_AUDIT_ACTIONS)[number];
