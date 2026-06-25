/** Institutional Launch Control Center™ — final operational cockpit before public launch. */

import { LAUNCH_CONTROL_CENTER_ADMIN_BRAND } from "./launchControlCenterAdmin";

export const LAUNCH_CONTROL_CENTER_BRAND = LAUNCH_CONTROL_CENTER_ADMIN_BRAND;

export const LAUNCH_CONTROL_SECTIONS = [
  { id: "readiness", label: "Readiness" },
  { id: "critical-blockers", label: "Critical Blockers" },
  { id: "launch-checklist", label: "Launch Checklist" },
  { id: "go-no-go", label: "Go / No-Go" },
  { id: "open-risks", label: "Open Risks" },
  { id: "resolved-risks", label: "Resolved Risks" },
  { id: "dependencies", label: "Dependencies" },
  { id: "launch-timeline", label: "Launch Timeline" }
] as const;

export type LaunchControlSectionId = (typeof LAUNCH_CONTROL_SECTIONS)[number]["id"];

export const LAUNCH_READINESS_DOMAINS = [
  { id: "infrastructure", label: "Infrastructure" },
  { id: "security", label: "Security" },
  { id: "payments", label: "Payments" },
  { id: "scheduling", label: "Scheduling" },
  { id: "consultants", label: "Consultants" },
  { id: "support", label: "Support" },
  { id: "governance", label: "Governance" },
  { id: "operations", label: "Operations" },
  { id: "crm", label: "CRM" },
  { id: "executive", label: "Executive" },
  { id: "monitoring", label: "Monitoring" },
  { id: "compliance", label: "Compliance" },
  { id: "backups", label: "Backups" },
  { id: "documentation", label: "Documentation" },
  { id: "training", label: "Training" }
] as const;

export type LaunchReadinessDomainId = (typeof LAUNCH_READINESS_DOMAINS)[number]["id"];

export const LAUNCH_READINESS_DOMAIN_LABELS: Record<LaunchReadinessDomainId, string> =
  Object.fromEntries(LAUNCH_READINESS_DOMAINS.map((item) => [item.id, item.label])) as Record<
    LaunchReadinessDomainId,
    string
  >;

export const LAUNCH_CHECKLIST_STATUSES = [
  "ready",
  "needs-attention",
  "blocked",
  "not-started"
] as const;

export type LaunchChecklistStatusId = (typeof LAUNCH_CHECKLIST_STATUSES)[number];

export const LAUNCH_CHECKLIST_STATUS_LABELS: Record<LaunchChecklistStatusId, string> = {
  ready: "Ready",
  "needs-attention": "Needs Attention",
  blocked: "Blocked",
  "not-started": "Not Started"
};

export const LAUNCH_RISK_SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type LaunchRiskSeverityId = (typeof LAUNCH_RISK_SEVERITIES)[number];

export const LAUNCH_RISK_SEVERITY_LABELS: Record<LaunchRiskSeverityId, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

export const LAUNCH_APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type LaunchApprovalStatusId = (typeof LAUNCH_APPROVAL_STATUSES)[number];

export const LAUNCH_CONTROL_CENTER_DB_TABLES = [
  "launch_readiness_items",
  "launch_checklist_entries",
  "launch_blockers",
  "launch_risks",
  "launch_dependencies",
  "launch_timeline_events"
] as const;

export const LAUNCH_CONTROL_AUDIT_ACTIONS = [
  "readiness-updated",
  "blocker-opened",
  "blocker-resolved",
  "risk-opened",
  "risk-resolved",
  "approval-recorded",
  "timeline-updated"
] as const;

export type LaunchControlAuditActionId = (typeof LAUNCH_CONTROL_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const LAUNCH_CONTROL_FUTURE_ARCHITECTURE = [
  { id: "blue-green", label: "Blue/Green Deployment" },
  { id: "regional-rollout", label: "Regional Rollout" },
  { id: "canary-release", label: "Canary Release" },
  { id: "launch-waves", label: "Launch Waves" },
  { id: "rollback-automation", label: "Rollback Automation" }
] as const;
