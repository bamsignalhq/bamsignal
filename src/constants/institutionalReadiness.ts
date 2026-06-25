/** Institutional Readiness Verification Engine™ — final authority for launch readiness. */

import type { GoNoGoVerdictId, ReadinessCheckTypeId, ReadinessSubsystemId } from "../types/institutionalReadiness";
import { INSTITUTIONAL_READINESS_BRAND } from "./institutionalReadinessAdmin";

export const READINESS_VERIFICATION_BRAND = INSTITUTIONAL_READINESS_BRAND;

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
  "go-with-conditions": "GO — with conditions",
  "no-go-member-only": "NO-GO — member app only",
  "no-go": "NO-GO"
};

export const READINESS_VERIFICATION_DB_TABLES = [
  "readiness_subsystem_contracts",
  "readiness_verification_checks",
  "readiness_dependency_links",
  "readiness_critical_issues",
  "readiness_verification_runs",
  "readiness_snapshots"
] as const;

export const READINESS_AUDIT_ACTIONS = [
  "verification-run",
  "subsystem-checked",
  "dependency-surfaced",
  "go-no-go-updated"
] as const;

export type ReadinessAuditActionId = (typeof READINESS_AUDIT_ACTIONS)[number];
