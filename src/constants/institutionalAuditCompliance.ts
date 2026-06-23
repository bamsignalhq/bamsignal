/** Institutional Audit & Compliance Center™ — permanent append-only institution audit layer. */

import { INSTITUTIONAL_COMPLIANCE_ADMIN_BRAND } from "./institutionalComplianceAdmin";

export const INSTITUTIONAL_AUDIT_COMPLIANCE_BRAND = INSTITUTIONAL_COMPLIANCE_ADMIN_BRAND;

export const INSTITUTIONAL_AUDIT_APPEND_ONLY_RULES = [
  "Append only.",
  "Never delete.",
  "Never modify history."
] as const;

export type AuditActionId =
  | "login"
  | "logout"
  | "permission-change"
  | "consultant-assignment"
  | "consultant-transfer"
  | "application-approval"
  | "payment-change"
  | "refund"
  | "meeting-creation"
  | "meeting-cancellation"
  | "introduction-action"
  | "archive-update"
  | "document-update"
  | "support-escalation"
  | "safety-action";

export type AuditTargetKindId =
  | "session"
  | "permission"
  | "consultant"
  | "application"
  | "payment"
  | "meeting"
  | "introduction"
  | "archive"
  | "document"
  | "support-ticket"
  | "safety-case"
  | "member"
  | "journey";

export type AuditSeverityId = "info" | "low" | "medium" | "high" | "critical";

export type AuditResultId = "success" | "failed";

export type InstitutionalComplianceMetricId =
  | "events-today"
  | "critical-events"
  | "permission-changes"
  | "payment-events"
  | "safety-actions"
  | "failed-actions";

export type AuditAction = {
  id: AuditActionId;
  label: string;
  category: string;
  targetKind: AuditTargetKindId;
  defaultSeverity: AuditSeverityId;
};

export const INSTITUTIONAL_AUDIT_ACTIONS: AuditAction[] = [
  {
    id: "login",
    label: "Login",
    category: "Access",
    targetKind: "session",
    defaultSeverity: "info"
  },
  {
    id: "logout",
    label: "Logout",
    category: "Access",
    targetKind: "session",
    defaultSeverity: "info"
  },
  {
    id: "permission-change",
    label: "Permission change",
    category: "Governance",
    targetKind: "permission",
    defaultSeverity: "high"
  },
  {
    id: "consultant-assignment",
    label: "Consultant assignment",
    category: "Concierge",
    targetKind: "consultant",
    defaultSeverity: "medium"
  },
  {
    id: "consultant-transfer",
    label: "Consultant transfer",
    category: "Concierge",
    targetKind: "consultant",
    defaultSeverity: "medium"
  },
  {
    id: "application-approval",
    label: "Application approval",
    category: "Concierge",
    targetKind: "application",
    defaultSeverity: "medium"
  },
  {
    id: "payment-change",
    label: "Payment change",
    category: "Finance",
    targetKind: "payment",
    defaultSeverity: "high"
  },
  {
    id: "refund",
    label: "Refund",
    category: "Finance",
    targetKind: "payment",
    defaultSeverity: "high"
  },
  {
    id: "meeting-creation",
    label: "Meeting creation",
    category: "Scheduling",
    targetKind: "meeting",
    defaultSeverity: "low"
  },
  {
    id: "meeting-cancellation",
    label: "Meeting cancellation",
    category: "Scheduling",
    targetKind: "meeting",
    defaultSeverity: "medium"
  },
  {
    id: "introduction-action",
    label: "Introduction action",
    category: "Concierge",
    targetKind: "introduction",
    defaultSeverity: "medium"
  },
  {
    id: "archive-update",
    label: "Archive update",
    category: "Records",
    targetKind: "archive",
    defaultSeverity: "medium"
  },
  {
    id: "document-update",
    label: "Document update",
    category: "Records",
    targetKind: "document",
    defaultSeverity: "medium"
  },
  {
    id: "support-escalation",
    label: "Support escalation",
    category: "Support",
    targetKind: "support-ticket",
    defaultSeverity: "high"
  },
  {
    id: "safety-action",
    label: "Safety action",
    category: "Safety",
    targetKind: "safety-case",
    defaultSeverity: "critical"
  }
];

export const INSTITUTIONAL_AUDIT_ACTION_LABELS: Record<AuditActionId, string> = Object.fromEntries(
  INSTITUTIONAL_AUDIT_ACTIONS.map((item) => [item.id, item.label])
) as Record<AuditActionId, string>;

export const INSTITUTIONAL_AUDIT_TARGET_LABELS: Record<AuditTargetKindId, string> = {
  session: "Session",
  permission: "Permission",
  consultant: "Consultant",
  application: "Application",
  payment: "Payment",
  meeting: "Meeting",
  introduction: "Introduction",
  archive: "Archive",
  document: "Document",
  "support-ticket": "Support ticket",
  "safety-case": "Safety case",
  member: "Member",
  journey: "Journey"
};

export const INSTITUTIONAL_AUDIT_SEVERITY_LABELS: Record<AuditSeverityId, string> = {
  info: "Info",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

export const INSTITUTIONAL_COMPLIANCE_FILTER_FIELDS = [
  { id: "date", label: "Date" },
  { id: "actor", label: "Actor" },
  { id: "action", label: "Action" },
  { id: "target", label: "Target" },
  { id: "severity", label: "Severity" }
] as const;

export type InstitutionalComplianceFilterFieldId =
  (typeof INSTITUTIONAL_COMPLIANCE_FILTER_FIELDS)[number]["id"];

export const INSTITUTIONAL_COMPLIANCE_METRICS: {
  id: InstitutionalComplianceMetricId;
  label: string;
  hint: string;
}[] = [
  { id: "events-today", label: "Events today", hint: "All institutional audit events recorded today." },
  { id: "critical-events", label: "Critical events", hint: "Safety and governance events at critical severity." },
  { id: "permission-changes", label: "Permission changes", hint: "Role and permission updates." },
  { id: "payment-events", label: "Payment events", hint: "Payment changes and refunds." },
  { id: "safety-actions", label: "Safety actions", hint: "Safety center escalations and interventions." },
  { id: "failed-actions", label: "Failed actions", hint: "Events that did not complete successfully." }
];

/** Future-ready capabilities — documented only, not yet implemented. */
export const INSTITUTIONAL_COMPLIANCE_FUTURE_CAPABILITIES = [
  {
    id: "regulatory-exports",
    label: "Regulatory exports",
    description:
      "NDPA, SOC2, and institution-specific audit bundles with immutable checksums and export attestations."
  },
  {
    id: "compliance-reporting",
    label: "Compliance reporting",
    description:
      "Scheduled PDF and CSV compliance summaries for board review, regulators, and external auditors."
  }
] as const;
