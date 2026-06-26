/** Launch Command Center™ — final operational command room for launch. */

import { LAUNCH_COMMAND_CENTER_ADMIN_BRAND } from "./launchCommandCenterAdmin";

export const LAUNCH_COMMAND_CENTER_BRAND = LAUNCH_COMMAND_CENTER_ADMIN_BRAND;

export const LAUNCH_COMMAND_REFRESH_INTERVAL_MS = 30_000;

export const LAUNCH_COMMAND_SECTIONS = [
  { id: "launch-readiness", label: "Launch Readiness" },
  { id: "production-health", label: "Production Health" },
  { id: "platform-health", label: "Platform Health" },
  { id: "critical-services", label: "Critical Services" },
  { id: "incidents", label: "Incidents" },
  { id: "current-deployments", label: "Current Deployments" },
  { id: "latest-release", label: "Latest Release" },
  { id: "startup-performance", label: "Startup Performance" },
  { id: "otp-success-rate", label: "OTP Success Rate" },
  { id: "payment-success-rate", label: "Payment Success Rate" },
  { id: "notification-delivery", label: "Notification Delivery" },
  { id: "database-health", label: "Database Health" },
  { id: "queue-health", label: "Queue Health" },
  { id: "security-alerts", label: "Security Alerts" },
  { id: "abuse-alerts", label: "Abuse Alerts" },
  { id: "support-queue", label: "Support Queue" },
  { id: "consultant-availability", label: "Consultant Availability" }
] as const;

export type LaunchCommandSectionId = (typeof LAUNCH_COMMAND_SECTIONS)[number]["id"];

export const LAUNCH_COMMAND_SECTION_LABELS: Record<LaunchCommandSectionId, string> =
  Object.fromEntries(LAUNCH_COMMAND_SECTIONS.map((item) => [item.id, item.label])) as Record<
    LaunchCommandSectionId,
    string
  >;

export const LAUNCH_READINESS_SCORE_DOMAINS = [
  { id: "overall", label: "Overall" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "security", label: "Security" },
  { id: "payments", label: "Payments" },
  { id: "messaging", label: "Messaging" },
  { id: "matching", label: "Matching" },
  { id: "consultations", label: "Consultations" },
  { id: "support", label: "Support" },
  { id: "operations", label: "Operations" }
] as const;

export type LaunchReadinessScoreId = (typeof LAUNCH_READINESS_SCORE_DOMAINS)[number]["id"];

export const LAUNCH_READINESS_SCORE_LABELS: Record<LaunchReadinessScoreId, string> =
  Object.fromEntries(LAUNCH_READINESS_SCORE_DOMAINS.map((item) => [item.id, item.label])) as Record<
    LaunchReadinessScoreId,
    string
  >;

export const LAUNCH_BLOCKER_SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type LaunchBlockerSeverityId = (typeof LAUNCH_BLOCKER_SEVERITIES)[number];

export const LAUNCH_BLOCKER_SEVERITY_LABELS: Record<LaunchBlockerSeverityId, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low"
};

export const LAUNCH_GO_NO_GO_OPTIONS = [
  { id: "go", label: "GO" },
  { id: "go-with-warnings", label: "GO WITH WARNINGS" },
  { id: "no-go", label: "NO GO" }
] as const;

export type LaunchGoNoGoId = (typeof LAUNCH_GO_NO_GO_OPTIONS)[number]["id"];

export const LAUNCH_GO_NO_GO_LABELS: Record<LaunchGoNoGoId, string> = {
  go: "GO",
  "go-with-warnings": "GO WITH WARNINGS",
  "no-go": "NO GO"
};

export type LaunchCommandHealthStatusId = "healthy" | "warning" | "critical";

export const LAUNCH_COMMAND_HEALTH_STATUS_LABELS: Record<LaunchCommandHealthStatusId, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical"
};

export const LAUNCH_COMMAND_CENTER_DB_TABLES = [
  "launch_command_readiness_scores",
  "launch_command_blockers",
  "launch_command_section_snapshots",
  "launch_command_incidents",
  "launch_command_deployments"
] as const;
