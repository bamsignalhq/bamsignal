import type {
  DocumentCategoryId,
  DocumentMetricId,
  DocumentPermissionId,
  DocumentStatusId
} from "../constants/documentCenter";

export type DocumentVersionEntry = {
  version: string;
  updatedAt: string;
  author: string;
  note: string;
};

export type DocumentApproval = {
  approvedBy: string;
  approvedAt: string;
  note: string;
};

export type DocumentAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
};

export type DocumentRecord = {
  id: string;
  slug: string;
  title: string;
  categoryId: DocumentCategoryId;
  version: string;
  author: string;
  owner: string;
  status: DocumentStatusId;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  summary: string;
  body: string;
  tags?: string[];
  relatedDocumentIds?: string[];
  viewCount: number;
  permissions: DocumentPermissionId[];
  versionHistory: DocumentVersionEntry[];
  approval: DocumentApproval | null;
};

export type PolicyVersionRecord = {
  id: string;
  policySlug: string;
  version: string;
  title: string;
  body: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
};

export type DocumentAcknowledgementRecord = {
  id: string;
  documentId: string;
  employeeEmail: string;
  version: string;
  readAt?: string;
  acknowledgedAt?: string;
};

export type KnowledgeArticleRecord = {
  id: string;
  slug: string;
  title: string;
  categoryId: DocumentCategoryId;
  status: DocumentStatusId;
  currentVersion: string;
  bodyMarkdown: string;
  attachments: DocumentAttachment[];
  tags: string[];
  publishedAt?: string;
  updatedAt: string;
  versionHistory: DocumentVersionEntry[];
};

export type DocumentSearchFilters = {
  query: string;
  categoryId: DocumentCategoryId | "all";
  status: DocumentStatusId | "all";
  owner: string;
  tag: string;
};

export type DocumentMetric = {
  id: DocumentMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type DocumentCenterBundle = {
  generatedAt: string;
  metrics: DocumentMetric[];
  documents: DocumentRecord[];
  knowledgeArticles: KnowledgeArticleRecord[];
  policyVersions: PolicyVersionRecord[];
  acknowledgements: DocumentAcknowledgementRecord[];
  categoryCounts: Record<DocumentCategoryId, number>;
  recentUpdates: DocumentRecord[];
  mostViewed: DocumentRecord[];
  pendingAcknowledgements: DocumentAcknowledgementRecord[];
  selectedDocument: DocumentRecord | null;
};

export type InstitutionalPoliciesBundle = {
  generatedAt: string;
  policies: DocumentRecord[];
  policyVersions: PolicyVersionRecord[];
  acknowledgements: DocumentAcknowledgementRecord[];
  pendingAcknowledgements: DocumentAcknowledgementRecord[];
};
