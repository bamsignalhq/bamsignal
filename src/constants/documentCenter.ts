/** Institutional Policy & Documentation Center™ — authoritative living documentation. */

import { DOCUMENT_CENTER_ADMIN_BRAND } from "./documentCenterAdmin";

export const DOCUMENT_CENTER_BRAND = DOCUMENT_CENTER_ADMIN_BRAND;

export type DocumentCategoryId =
  | "policies"
  | "operating-procedures"
  | "consultant-guides"
  | "support-guides"
  | "finance-manuals"
  | "research-manuals"
  | "incident-response"
  | "security"
  | "legal"
  | "hr"
  | "training"
  | "meeting-templates"
  | "journey-frameworks";

export type DocumentStatusId =
  | "draft"
  | "review"
  | "approved"
  | "published"
  | "archived";

export type DocumentPermissionId = "view" | "edit" | "approve" | "archive" | "publish";

export type DocumentMetricId =
  | "documents"
  | "knowledge-articles"
  | "recent-updates"
  | "pending-review"
  | "pending-acknowledgements";

export const DOCUMENT_CATEGORIES: {
  id: DocumentCategoryId;
  label: string;
  hint: string;
}[] = [
  { id: "policies", label: "Policies", hint: "Institution-wide policy documents." },
  { id: "operating-procedures", label: "Operating Procedures", hint: "SOPs, runbooks, and daily operations." },
  { id: "consultant-guides", label: "Consultant Guides", hint: "Signal Concierge consultant playbooks." },
  { id: "support-guides", label: "Support Guides", hint: "Member support and escalation guides." },
  { id: "finance-manuals", label: "Finance Manuals", hint: "Finance operations and reconciliation manuals." },
  { id: "research-manuals", label: "Research Manuals", hint: "Institute research methodology and reports." },
  { id: "incident-response", label: "Incident Response", hint: "Crisis, safety, and incident procedures." },
  { id: "security", label: "Security", hint: "Security policies and access controls." },
  { id: "legal", label: "Legal", hint: "Contracts, compliance, and regulatory documentation." },
  { id: "hr", label: "HR", hint: "People policies, onboarding, and HR procedures." },
  { id: "training", label: "Training", hint: "Onboarding and skills training curricula." },
  { id: "meeting-templates", label: "Meeting Templates", hint: "Consultation and introduction templates." },
  { id: "journey-frameworks", label: "Journey Frameworks", hint: "Member journey and concierge frameworks." }
];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategoryId, string> = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((item) => [item.id, item.label])
) as Record<DocumentCategoryId, string>;

export const DOCUMENT_STATUSES: { id: DocumentStatusId; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "review", label: "In Review" },
  { id: "approved", label: "Approved" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" }
];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatusId, string> = Object.fromEntries(
  DOCUMENT_STATUSES.map((item) => [item.id, item.label])
) as Record<DocumentStatusId, string>;

export const DOCUMENT_PERMISSIONS: { id: DocumentPermissionId; label: string }[] = [
  { id: "view", label: "View" },
  { id: "edit", label: "Edit" },
  { id: "approve", label: "Approve" },
  { id: "publish", label: "Publish" },
  { id: "archive", label: "Archive" }
];

export const DOCUMENT_PERMISSION_LABELS: Record<DocumentPermissionId, string> = Object.fromEntries(
  DOCUMENT_PERMISSIONS.map((item) => [item.id, item.label])
) as Record<DocumentPermissionId, string>;

export const DOCUMENT_CENTER_METRICS: { id: DocumentMetricId; label: string }[] = [
  { id: "documents", label: "Documents" },
  { id: "knowledge-articles", label: "Knowledge Articles" },
  { id: "recent-updates", label: "Recent Updates" },
  { id: "pending-review", label: "Pending Review" },
  { id: "pending-acknowledgements", label: "Pending Acknowledgements" }
];

export const DOCUMENT_CENTER_DB_TABLES = [
  "documents",
  "document_versions",
  "document_categories",
  "document_acknowledgements",
  "policy_versions",
  "knowledge_articles"
] as const;

export const DOCUMENT_AUDIT_ACTIONS = [
  "document-published",
  "document-updated",
  "document-archived",
  "document-acknowledged",
  "knowledge-published",
  "policy-published"
] as const;

export type DocumentAuditActionId = (typeof DOCUMENT_AUDIT_ACTIONS)[number];

export const DOCUMENT_CENTER_FUTURE_KINDS = [
  { id: "ai-knowledge-assistant", label: "AI knowledge assistant" },
  { id: "version-diffing", label: "Version diffing" },
  { id: "full-text-search-index", label: "Full-text search index" }
] as const;
