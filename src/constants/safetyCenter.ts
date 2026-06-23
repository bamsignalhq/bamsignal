/** Crisis & Safety Center™ — institutional safety command center. Trust is the product. */

export const SAFETY_CENTER_BRAND = "Crisis & Safety Center™";

export const SAFETY_IMMUTABLE_RULES = [
  "Safety cases are immutable.",
  "Full audit trail.",
  "No hard deletes."
] as const;

export type SafetyCaseTypeId =
  | "harassment"
  | "fraud"
  | "catfishing"
  | "threats"
  | "identity-concerns"
  | "abusive-behaviour"
  | "blackmail"
  | "scam-reports"
  | "emergency-escalation";

/** @deprecated Use SafetyCaseTypeId */
export type SafetyCategoryId = SafetyCaseTypeId;

export type SafetySeverityId = "low" | "medium" | "high" | "critical";

export type SafetyStatusId =
  | "reported"
  | "investigating"
  | "action-required"
  | "resolved"
  | "closed";

export type SafetyActionId =
  | "warning"
  | "restriction"
  | "suspension"
  | "ban"
  | "law-enforcement-referral";

export type SafetyWorkflowId =
  | "report"
  | "investigate"
  | "require-action"
  | "apply-action"
  | "resolve"
  | "close";

export type SafetyMetricId =
  | "open-cases"
  | "average-resolution-time"
  | "high-risk-cases"
  | "repeat-offenders";

export const SAFETY_CASE_TYPES: {
  id: SafetyCaseTypeId;
  label: string;
}[] = [
  { id: "harassment", label: "Harassment" },
  { id: "fraud", label: "Fraud" },
  { id: "catfishing", label: "Catfishing" },
  { id: "threats", label: "Threats" },
  { id: "identity-concerns", label: "Identity Concerns" },
  { id: "abusive-behaviour", label: "Abusive Behaviour" },
  { id: "blackmail", label: "Blackmail" },
  { id: "scam-reports", label: "Scam Reports" },
  { id: "emergency-escalation", label: "Emergency Escalation" }
];

/** @deprecated Use SAFETY_CASE_TYPES */
export const SAFETY_CATEGORIES = SAFETY_CASE_TYPES;

export const SAFETY_CASE_TYPE_LABELS: Record<SafetyCaseTypeId, string> = Object.fromEntries(
  SAFETY_CASE_TYPES.map((item) => [item.id, item.label])
) as Record<SafetyCaseTypeId, string>;

/** @deprecated Use SAFETY_CASE_TYPE_LABELS */
export const SAFETY_CATEGORY_LABELS = SAFETY_CASE_TYPE_LABELS;

export const SAFETY_SEVERITIES: {
  id: SafetySeverityId;
  label: string;
}[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" }
];

export const SAFETY_SEVERITY_LABELS: Record<SafetySeverityId, string> = Object.fromEntries(
  SAFETY_SEVERITIES.map((item) => [item.id, item.label])
) as Record<SafetySeverityId, string>;

export const SAFETY_STATUSES: {
  id: SafetyStatusId;
  label: string;
}[] = [
  { id: "reported", label: "Reported" },
  { id: "investigating", label: "Investigating" },
  { id: "action-required", label: "Action Required" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" }
];

export const SAFETY_STATUS_LABELS: Record<SafetyStatusId, string> = Object.fromEntries(
  SAFETY_STATUSES.map((item) => [item.id, item.label])
) as Record<SafetyStatusId, string>;

export const SAFETY_ACTIONS: {
  id: SafetyActionId;
  label: string;
}[] = [
  { id: "warning", label: "Warning" },
  { id: "restriction", label: "Restriction" },
  { id: "suspension", label: "Suspension" },
  { id: "ban", label: "Ban" },
  { id: "law-enforcement-referral", label: "Law Enforcement Referral" }
];

export const SAFETY_ACTION_LABELS: Record<SafetyActionId, string> = Object.fromEntries(
  SAFETY_ACTIONS.map((item) => [item.id, item.label])
) as Record<SafetyActionId, string>;

export const SAFETY_WORKFLOWS: {
  id: SafetyWorkflowId;
  label: string;
  targetStatus: SafetyStatusId | null;
}[] = [
  { id: "report", label: "Report", targetStatus: "reported" },
  { id: "investigate", label: "Investigate", targetStatus: "investigating" },
  { id: "require-action", label: "Require action", targetStatus: "action-required" },
  { id: "apply-action", label: "Apply action", targetStatus: null },
  { id: "resolve", label: "Resolve", targetStatus: "resolved" },
  { id: "close", label: "Close", targetStatus: "closed" }
];

export const SAFETY_WORKFLOW_LABELS: Record<SafetyWorkflowId, string> = Object.fromEntries(
  SAFETY_WORKFLOWS.map((item) => [item.id, item.label])
) as Record<SafetyWorkflowId, string>;

export const SAFETY_METRICS: {
  id: SafetyMetricId;
  label: string;
}[] = [
  { id: "open-cases", label: "Open Cases" },
  { id: "average-resolution-time", label: "Average Resolution Time" },
  { id: "high-risk-cases", label: "High Risk Cases" },
  { id: "repeat-offenders", label: "Repeat Offenders" }
];

/**
 * Future-ready safety capabilities — documented only, not implemented.
 */
export const SAFETY_CENTER_FUTURE_KINDS = [
  { id: "safety-specialists", label: "Safety specialists" },
  { id: "emergency-hotline", label: "Emergency hotline" },
  { id: "legal-escalation", label: "Legal escalation" }
] as const;
