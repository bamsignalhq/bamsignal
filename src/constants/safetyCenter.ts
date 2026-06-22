/** Crisis & Safety Center™ — proactive safety infrastructure. */

export const SAFETY_CENTER_BRAND = "Crisis & Safety Center™";

export const SAFETY_IMMUTABLE_RULES = [
  "Safety incidents are immutable.",
  "Full audit trail.",
  "No hard deletes."
] as const;

export type SafetyCategoryId =
  | "harassment"
  | "fraud"
  | "catfishing"
  | "identity-concerns"
  | "abusive-conduct"
  | "threats"
  | "payment-abuse"
  | "consultant-misconduct"
  | "emergency-escalation";

export type SafetySeverityId = "low" | "medium" | "high" | "critical";

export type SafetyStatusId =
  | "reported"
  | "under-review"
  | "escalated"
  | "resolved"
  | "closed";

export type SafetyWorkflowId =
  | "report"
  | "review"
  | "escalate"
  | "assign-investigator"
  | "resolve"
  | "close";

export type SafetyMetricId =
  | "open-incidents"
  | "critical-incidents"
  | "resolution-time"
  | "escalations"
  | "repeat-reports";

export const SAFETY_CATEGORIES: {
  id: SafetyCategoryId;
  label: string;
}[] = [
  { id: "harassment", label: "Harassment" },
  { id: "fraud", label: "Fraud" },
  { id: "catfishing", label: "Catfishing" },
  { id: "identity-concerns", label: "Identity Concerns" },
  { id: "abusive-conduct", label: "Abusive Conduct" },
  { id: "threats", label: "Threats" },
  { id: "payment-abuse", label: "Payment Abuse" },
  { id: "consultant-misconduct", label: "Consultant Misconduct" },
  { id: "emergency-escalation", label: "Emergency Escalation" }
];

export const SAFETY_CATEGORY_LABELS: Record<SafetyCategoryId, string> = Object.fromEntries(
  SAFETY_CATEGORIES.map((item) => [item.id, item.label])
) as Record<SafetyCategoryId, string>;

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
  { id: "under-review", label: "Under Review" },
  { id: "escalated", label: "Escalated" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" }
];

export const SAFETY_STATUS_LABELS: Record<SafetyStatusId, string> = Object.fromEntries(
  SAFETY_STATUSES.map((item) => [item.id, item.label])
) as Record<SafetyStatusId, string>;

export const SAFETY_WORKFLOWS: {
  id: SafetyWorkflowId;
  label: string;
  targetStatus: SafetyStatusId | null;
}[] = [
  { id: "report", label: "Report", targetStatus: "reported" },
  { id: "review", label: "Review", targetStatus: "under-review" },
  { id: "escalate", label: "Escalate", targetStatus: "escalated" },
  { id: "assign-investigator", label: "Assign investigator", targetStatus: null },
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
  { id: "open-incidents", label: "Open incidents" },
  { id: "critical-incidents", label: "Critical incidents" },
  { id: "resolution-time", label: "Resolution time" },
  { id: "escalations", label: "Escalations" },
  { id: "repeat-reports", label: "Repeat reports" }
];

/**
 * Future-ready safety capabilities — documented only, not implemented.
 */
export const SAFETY_CENTER_FUTURE_KINDS = [
  { id: "trust-scores", label: "Trust scores" },
  { id: "emergency-hotline", label: "Emergency hotline" },
  { id: "identity-investigations", label: "Identity investigations" }
] as const;
