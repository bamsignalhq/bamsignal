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
  summary: string;
  body: string;
  viewCount: number;
  permissions: DocumentPermissionId[];
  versionHistory: DocumentVersionEntry[];
  approval: DocumentApproval | null;
};

export type DocumentSearchFilters = {
  query: string;
  categoryId: DocumentCategoryId | "all";
  status: DocumentStatusId | "all";
  owner: string;
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
  categoryCounts: Record<DocumentCategoryId, number>;
  recentUpdates: DocumentRecord[];
  mostViewed: DocumentRecord[];
  selectedDocument: DocumentRecord | null;
};
