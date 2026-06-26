/** Data Governance & Privacy Center™ — centralized privacy and governance operations. */

import { DATA_GOVERNANCE_CENTER_ADMIN_BRAND } from "./dataGovernanceCenterAdmin";

export const DATA_GOVERNANCE_CENTER_BRAND = DATA_GOVERNANCE_CENTER_ADMIN_BRAND;

export const DATA_GOVERNANCE_REFRESH_INTERVAL_MS = 30_000;

export type DataGovernanceModuleId =
  | "consent-management"
  | "data-retention"
  | "deletion-requests"
  | "export-requests"
  | "privacy-requests"
  | "legal-holds"
  | "audit-exports";

export type DataGovernanceToolId =
  | "export-member"
  | "delete-member"
  | "anonymize"
  | "retention-rules"
  | "policy-versions";

export type GovernanceTrailActionId = "accessed" | "exported" | "deleted" | "approved";

export const DATA_GOVERNANCE_MODULES: { id: DataGovernanceModuleId; label: string }[] = [
  { id: "consent-management", label: "Consent management" },
  { id: "data-retention", label: "Data retention" },
  { id: "deletion-requests", label: "Deletion requests" },
  { id: "export-requests", label: "Export requests" },
  { id: "privacy-requests", label: "Privacy requests" },
  { id: "legal-holds", label: "Legal holds" },
  { id: "audit-exports", label: "Audit exports" }
];

export const DATA_GOVERNANCE_MODULE_LABELS: Record<DataGovernanceModuleId, string> =
  Object.fromEntries(DATA_GOVERNANCE_MODULES.map((item) => [item.id, item.label])) as Record<
    DataGovernanceModuleId,
    string
  >;

export const DATA_GOVERNANCE_TOOLS: { id: DataGovernanceToolId; label: string; hint: string }[] = [
  { id: "export-member", label: "Export member", hint: "Generate member data export package" },
  { id: "delete-member", label: "Delete member", hint: "Process verified deletion request" },
  { id: "anonymize", label: "Anonymize", hint: "Anonymize member PII while preserving aggregates" },
  { id: "retention-rules", label: "Retention rules", hint: "Review and update retention policies" },
  { id: "policy-versions", label: "Policy versions", hint: "Publish and track privacy policy versions" }
];

export const GOVERNANCE_AUDIT_ACTION_LABELS: Record<GovernanceTrailActionId, string> = {
  accessed: "Accessed",
  exported: "Exported",
  deleted: "Deleted",
  approved: "Approved"
};

export const DATA_GOVERNANCE_AREAS = [
  { id: "classification", label: "Data Classification" },
  { id: "retention", label: "Retention Policies" },
  { id: "deletion", label: "Deletion Requests" },
  { id: "consent", label: "Consent Records" },
  { id: "privacy", label: "Privacy Requests" },
  { id: "export", label: "Export Requests" },
  { id: "regional", label: "Regional Policies" },
  { id: "inventory", label: "Data Inventory" },
  { id: "sensitive", label: "Sensitive Data" }
] as const;

export type DataGovernanceAreaId = (typeof DATA_GOVERNANCE_AREAS)[number]["id"];

export const DATA_CLASSES = [
  "public",
  "internal",
  "confidential",
  "highly-confidential",
  "restricted"
] as const;

export type DataClassId = (typeof DATA_CLASSES)[number];

export const DATA_CLASS_LABELS: Record<DataClassId, string> = {
  public: "Public",
  internal: "Internal",
  confidential: "Confidential",
  "highly-confidential": "Highly Confidential",
  restricted: "Restricted"
};

export const RETENTION_CATEGORIES = [
  { id: "journey-records", label: "Journey Records" },
  { id: "applications", label: "Applications" },
  { id: "consultation-notes", label: "Consultation Notes" },
  { id: "messages", label: "Messages" },
  { id: "documents", label: "Documents" },
  { id: "support-tickets", label: "Support Tickets" },
  { id: "audit-logs", label: "Audit Logs" },
  { id: "financial-records", label: "Financial Records" },
  { id: "archive-policies", label: "Archive Policies" }
] as const;

export type RetentionCategoryId = (typeof RETENTION_CATEGORIES)[number]["id"];

export const PRIVACY_REQUEST_TYPES = [
  { id: "download", label: "Download My Data" },
  { id: "delete", label: "Delete My Data" },
  { id: "correct", label: "Correct My Data" },
  { id: "consent-withdrawal", label: "Consent Withdrawal" },
  { id: "processing-restriction", label: "Processing Restriction" }
] as const;

export type PrivacyRequestTypeId = (typeof PRIVACY_REQUEST_TYPES)[number]["id"];

export const PRIVACY_REQUEST_STATUSES = [
  "pending",
  "in-review",
  "processing",
  "completed",
  "rejected"
] as const;

export type PrivacyRequestStatusId = (typeof PRIVACY_REQUEST_STATUSES)[number];

export const PRIVACY_REQUEST_STATUS_LABELS: Record<PrivacyRequestStatusId, string> = {
  pending: "Pending",
  "in-review": "In Review",
  processing: "Processing",
  completed: "Completed",
  rejected: "Rejected"
};

export const CONSENT_STATUSES = ["active", "withdrawn", "superseded"] as const;
export type ConsentStatusId = (typeof CONSENT_STATUSES)[number];

export const DATA_GOVERNANCE_CENTER_DB_TABLES = [
  "data_inventory_items",
  "retention_policies",
  "privacy_requests",
  "consent_records",
  "regional_policies",
  "sensitive_data_registers",
  "legal_holds",
  "policy_versions",
  "governance_audit_log",
  "audit_exports"
] as const;

export const DATA_GOVERNANCE_AUDIT_ACTIONS = [
  "inventory-updated",
  "retention-updated",
  "privacy-request-opened",
  "privacy-request-completed",
  "consent-recorded",
  "consent-withdrawn",
  "regional-policy-updated"
] as const;

export type DataGovernanceAuditActionId = (typeof DATA_GOVERNANCE_AUDIT_ACTIONS)[number];

/** Future-ready — documented only, not implemented. */
export const DATA_GOVERNANCE_FUTURE_ARCHITECTURE = [
  { id: "gdpr", label: "GDPR" },
  { id: "ndpr", label: "NDPR" },
  { id: "ccpa", label: "CCPA" },
  { id: "regional-policies", label: "Regional Policies" },
  { id: "automatic-retention", label: "Automatic Retention" },
  { id: "automatic-anonymization", label: "Automatic Anonymization" }
] as const;
