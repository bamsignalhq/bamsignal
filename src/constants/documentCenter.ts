/** Document Center™ — institutional document repository. */

export const DOCUMENT_CENTER_BRAND = "Document Center™";

export type DocumentCategoryId =
  | "policies"
  | "procedures"
  | "consultant-guides"
  | "training"
  | "operations"
  | "research"
  | "legal"
  | "templates"
  | "meeting-frameworks"
  | "culture";

export type DocumentStatusId = "draft" | "review" | "approved" | "archived";

export const DOCUMENT_CATEGORIES: {
  id: DocumentCategoryId;
  label: string;
  hint: string;
}[] = [
  { id: "policies", label: "Policies", hint: "Institution-wide policy documents." },
  { id: "procedures", label: "Procedures", hint: "Standard operating procedures." },
  { id: "consultant-guides", label: "Consultant Guides", hint: "Signal Concierge consultant playbooks." },
  { id: "training", label: "Training", hint: "Onboarding and skills training." },
  { id: "operations", label: "Operations", hint: "Operations center runbooks." },
  { id: "research", label: "Research", hint: "Institute research and insights." },
  { id: "legal", label: "Legal", hint: "Legal and compliance documents." },
  { id: "templates", label: "Templates", hint: "Reusable document templates." },
  { id: "meeting-frameworks", label: "Meeting Frameworks", hint: "Consultation and introduction frameworks." },
  { id: "culture", label: "Culture", hint: "Values, culture, and institutional principles." }
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

/**
 * Future-ready document capabilities — documented only, not implemented.
 */
export const DOCUMENT_CENTER_FUTURE_KINDS = [
  { id: "document-signatures", label: "Document signatures" },
  { id: "ai-search", label: "AI search" },
  { id: "knowledge-retrieval", label: "Knowledge retrieval" }
] as const;
