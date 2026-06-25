/** Data Governance, Privacy & Retention Center™ — institutional data stewardship layer. */

import { DATA_GOVERNANCE_CENTER_ADMIN_BRAND } from "./dataGovernanceCenterAdmin";

export const DATA_GOVERNANCE_CENTER_BRAND = DATA_GOVERNANCE_CENTER_ADMIN_BRAND;

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
  "sensitive_data_registers"
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
  { id: "legal-hold", label: "Legal Hold" }
] as const;
