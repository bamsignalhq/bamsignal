/** Document Center™ — institutional knowledge management. */

export const DOCUMENT_CENTER_BRAND = "Document Center™";

export type DocumentCategoryId =
  | "policies"
  | "training"
  | "consultant-guides"
  | "operations-manuals"
  | "research-reports"
  | "contracts"
  | "templates"
  | "compliance"
  | "safety-procedures";

export type DocumentStatusId = "draft" | "review" | "approved" | "archived";

export type DocumentPermissionId = "view" | "edit" | "approve" | "archive";

export type DocumentMetricId =
  | "documents"
  | "recent-updates"
  | "most-viewed"
  | "pending-review";

export const DOCUMENT_CATEGORIES: {
  id: DocumentCategoryId;
  label: string;
  hint: string;
}[] = [
  { id: "policies", label: "Policies", hint: "Institution-wide policy documents." },
  { id: "training", label: "Training", hint: "Onboarding and skills training." },
  { id: "consultant-guides", label: "Consultant Guides", hint: "Signal Concierge consultant playbooks." },
  { id: "operations-manuals", label: "Operations Manuals", hint: "SOPs, runbooks, and operational procedures." },
  { id: "research-reports", label: "Research Reports", hint: "Institute research and insights." },
  { id: "contracts", label: "Contracts", hint: "Vendor, consultant, and institutional agreements." },
  { id: "templates", label: "Templates", hint: "Reusable document templates." },
  { id: "compliance", label: "Compliance", hint: "Audit, legal, and regulatory documentation." },
  { id: "safety-procedures", label: "Safety Procedures", hint: "Crisis and safety institutional procedures." }
];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategoryId, string> = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((item) => [item.id, item.label])
) as Record<DocumentCategoryId, string>;

export const DOCUMENT_STATUSES: {
  id: DocumentStatusId;
  label: string;
}[] = [
  { id: "draft", label: "Draft" },
  { id: "review", label: "Review" },
  { id: "approved", label: "Approved" },
  { id: "archived", label: "Archived" }
];

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatusId, string> = Object.fromEntries(
  DOCUMENT_STATUSES.map((item) => [item.id, item.label])
) as Record<DocumentStatusId, string>;

export const DOCUMENT_PERMISSIONS: {
  id: DocumentPermissionId;
  label: string;
}[] = [
  { id: "view", label: "View" },
  { id: "edit", label: "Edit" },
  { id: "approve", label: "Approve" },
  { id: "archive", label: "Archive" }
];

export const DOCUMENT_PERMISSION_LABELS: Record<DocumentPermissionId, string> = Object.fromEntries(
  DOCUMENT_PERMISSIONS.map((item) => [item.id, item.label])
) as Record<DocumentPermissionId, string>;

export const DOCUMENT_CENTER_METRICS: {
  id: DocumentMetricId;
  label: string;
}[] = [
  { id: "documents", label: "Documents" },
  { id: "recent-updates", label: "Recent Updates" },
  { id: "most-viewed", label: "Most Viewed" },
  { id: "pending-review", label: "Pending Review" }
];

/**
 * Future-ready document capabilities — documented only, not implemented.
 */
export const DOCUMENT_CENTER_FUTURE_KINDS = [
  { id: "knowledge-search", label: "Knowledge search" },
  { id: "ai-knowledge-assistant", label: "AI knowledge assistant" },
  { id: "version-diffing", label: "Version diffing" }
] as const;
