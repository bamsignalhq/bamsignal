/** Audit & Compliance Center™ — append-only operational audit layer. */

export const AUDIT_CENTER_BRAND = "Audit & Compliance Center™";

export const AUDIT_APPEND_ONLY_RULES = [
  "Append only.",
  "Never delete.",
  "Never modify history."
] as const;

export type AuditActionId =
  | "login"
  | "logout"
  | "application-review"
  | "consultant-assignment"
  | "payment-changes"
  | "introduction-changes"
  | "member-updates"
  | "archive-updates"
  | "permissions-updates"
  | "exports"
  | "notifications";

export type AuditEntityId =
  | "session"
  | "application"
  | "consultant"
  | "payment"
  | "introduction"
  | "member"
  | "archive"
  | "permission"
  | "export"
  | "notification";

export type AuditResultId = "success" | "failed";

export type AuditComplianceMetricId =
  | "events-today"
  | "assignments"
  | "payments"
  | "permission-changes"
  | "exports"
  | "failed-actions";

export const AUDIT_TRACKED_ACTIONS: {
  id: AuditActionId;
  label: string;
  entity: AuditEntityId;
}[] = [
  { id: "login", label: "Login", entity: "session" },
  { id: "logout", label: "Logout", entity: "session" },
  { id: "application-review", label: "Application review", entity: "application" },
  { id: "consultant-assignment", label: "Consultant assignment", entity: "consultant" },
  { id: "payment-changes", label: "Payment changes", entity: "payment" },
  { id: "introduction-changes", label: "Introduction changes", entity: "introduction" },
  { id: "member-updates", label: "Member updates", entity: "member" },
  { id: "archive-updates", label: "Archive updates", entity: "archive" },
  { id: "permissions-updates", label: "Permissions updates", entity: "permission" },
  { id: "exports", label: "Exports", entity: "export" },
  { id: "notifications", label: "Notifications", entity: "notification" }
];

export const AUDIT_ACTION_LABELS: Record<AuditActionId, string> = Object.fromEntries(
  AUDIT_TRACKED_ACTIONS.map((item) => [item.id, item.label])
) as Record<AuditActionId, string>;

export const AUDIT_ENTITY_LABELS: Record<AuditEntityId, string> = {
  session: "Session",
  application: "Application",
  consultant: "Consultant",
  payment: "Payment",
  introduction: "Introduction",
  member: "Member",
  archive: "Archive",
  permission: "Permission",
  export: "Export",
  notification: "Notification"
};

export const AUDIT_FILTER_FIELDS = [
  { id: "journeyId", label: "Journey ID" },
  { id: "consultant", label: "Consultant" },
  { id: "member", label: "Member" },
  { id: "date", label: "Date" },
  { id: "action", label: "Action" },
  { id: "entity", label: "Entity" }
] as const;

export type AuditFilterFieldId = (typeof AUDIT_FILTER_FIELDS)[number]["id"];

export const AUDIT_COMPLIANCE_METRICS: {
  id: AuditComplianceMetricId;
  label: string;
  hint: string;
}[] = [
  { id: "events-today", label: "Events today", hint: "All audit events recorded today." },
  { id: "assignments", label: "Assignments", hint: "Consultant assignment events." },
  { id: "payments", label: "Payments", hint: "Payment change events." },
  { id: "permission-changes", label: "Permission changes", hint: "Permissions update events." },
  { id: "exports", label: "Exports", hint: "Data export events." },
  { id: "failed-actions", label: "Failed actions", hint: "Events with failed result." }
];
