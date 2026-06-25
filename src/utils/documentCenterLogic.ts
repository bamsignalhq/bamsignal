import { DOCUMENT_CATEGORIES, DOCUMENT_CENTER_METRICS } from "../constants/documentCenter";
import { DOCUMENT_CENTER_SEED } from "../data/documentCenterSeed";
import type { DocumentMetric, DocumentRecord, DocumentSearchFilters } from "../types/documentCenter";
import type { DocumentCategoryId, DocumentStatusId } from "../constants/documentCenter";

const RECENT_UPDATE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeDocument(document: DocumentRecord): DocumentRecord {
  return {
    ...document,
    body: document.body ?? document.summary,
    viewCount: document.viewCount ?? 0,
    permissions: document.permissions ?? ["view"],
    tags: document.tags ?? [],
    relatedDocumentIds: document.relatedDocumentIds ?? []
  };
}

export function listDocuments(): DocumentRecord[] {
  return DOCUMENT_CENTER_SEED.map(normalizeDocument);
}

export function findDocumentById(documents: DocumentRecord[], documentId: string | null): DocumentRecord | null {
  if (!documentId) return null;
  return documents.find((document) => document.id === documentId) ?? null;
}

export function sortDocumentsByUpdatedAt(documents: DocumentRecord[]): DocumentRecord[] {
  return [...documents].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

export function sortDocumentsByViewCount(documents: DocumentRecord[]): DocumentRecord[] {
  return [...documents].sort((left, right) => right.viewCount - left.viewCount);
}

export function filterDocuments(documents: DocumentRecord[], filters: DocumentSearchFilters): DocumentRecord[] {
  const query = filters.query.trim().toLowerCase();

  return documents.filter((document) => {
    if (filters.categoryId !== "all" && document.categoryId !== filters.categoryId) return false;
    if (filters.status !== "all" && document.status !== filters.status) return false;
    if (filters.owner && !document.owner.toLowerCase().includes(filters.owner.toLowerCase())) return false;
    if (filters.tag && !(document.tags ?? []).some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase()))) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      document.title,
      document.summary,
      document.body,
      document.author,
      document.owner,
      document.slug,
      ...(document.tags ?? [])
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function countDocumentsByCategory(documents: DocumentRecord[]): Record<DocumentCategoryId, number> {
  const counts = Object.fromEntries(
    DOCUMENT_CATEGORIES.map((category) => [category.id, 0])
  ) as Record<DocumentCategoryId, number>;

  for (const document of documents) {
    counts[document.categoryId] = (counts[document.categoryId] ?? 0) + 1;
  }

  return counts;
}

export function countByStatus(documents: DocumentRecord[], status: DocumentStatusId): number {
  return documents.filter((document) => document.status === status).length;
}

export function listRecentUpdates(documents: DocumentRecord[]): DocumentRecord[] {
  const cutoff = Date.now() - RECENT_UPDATE_WINDOW_MS;
  return sortDocumentsByUpdatedAt(documents.filter((document) => new Date(document.updatedAt).getTime() >= cutoff));
}

export function listMostViewed(documents: DocumentRecord[], limit = 3): DocumentRecord[] {
  return sortDocumentsByViewCount(documents).slice(0, limit);
}

export function buildDocumentMetrics(
  documents: DocumentRecord[],
  knowledgeCount = 0,
  pendingAcknowledgements = 0
): DocumentMetric[] {
  const recentUpdates = listRecentUpdates(documents);
  const mostViewed = listMostViewed(documents, 1)[0];
  const pendingReview = countByStatus(documents, "review");

  const values: Record<string, string> = {
    documents: String(documents.length),
    "knowledge-articles": String(knowledgeCount),
    "recent-updates": String(recentUpdates.length),
    "most-viewed": mostViewed ? `${mostViewed.title} (${mostViewed.viewCount})` : "—",
    "pending-review": String(pendingReview),
    "pending-acknowledgements": String(pendingAcknowledgements)
  };

  return DOCUMENT_CENTER_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue:
      metric.id === "documents"
        ? documents.length
        : metric.id === "knowledge-articles"
          ? knowledgeCount
          : metric.id === "recent-updates"
            ? recentUpdates.length
            : metric.id === "pending-review"
              ? pendingReview
              : metric.id === "pending-acknowledgements"
                ? pendingAcknowledgements
                : metric.id === "most-viewed"
                  ? mostViewed?.viewCount
                  : undefined
  }));
}

export function emptyDocumentFilters(): DocumentSearchFilters {
  return {
    query: "",
    categoryId: "all",
    status: "all",
    owner: "",
    tag: ""
  };
}

export function listPolicyDocuments(documents: DocumentRecord[]): DocumentRecord[] {
  return documents.filter((document) => document.categoryId === "policies");
}

export function listPendingAcknowledgements(
  acknowledgements: import("../types/documentCenter").DocumentAcknowledgementRecord[]
): import("../types/documentCenter").DocumentAcknowledgementRecord[] {
  return acknowledgements.filter((item) => item.readAt && !item.acknowledgedAt);
}

export function searchKnowledgeArticles(
  articles: import("../types/documentCenter").KnowledgeArticleRecord[],
  queryText = ""
) {
  const query = queryText.trim().toLowerCase();
  if (!query) return articles;
  return articles.filter((article) => {
    const haystack = [article.title, article.bodyMarkdown, article.slug, ...article.tags]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function recordAcknowledgement(
  acknowledgements: import("../types/documentCenter").DocumentAcknowledgementRecord[],
  input: {
    documentId: string;
    employeeEmail: string;
    version: string;
    readAt?: string;
    acknowledgedAt?: string;
  }
) {
  const existing = acknowledgements.find(
    (item) =>
      item.documentId === input.documentId &&
      item.employeeEmail === input.employeeEmail &&
      item.version === input.version
  );
  if (existing?.acknowledgedAt) {
    return { acknowledgements, created: false };
  }
  const record = {
    id: existing?.id ?? `ack_${Date.now()}`,
    documentId: input.documentId,
    employeeEmail: input.employeeEmail,
    version: input.version,
    readAt: input.readAt ?? existing?.readAt ?? new Date().toISOString(),
    acknowledgedAt: input.acknowledgedAt ?? new Date().toISOString()
  };
  const next = existing
    ? acknowledgements.map((item) => (item.id === existing.id ? record : item))
    : [...acknowledgements, record];
  return { acknowledgements: next, created: !existing };
}
