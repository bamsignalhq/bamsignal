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
    permissions: document.permissions ?? ["view"]
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
    if (!query) return true;

    const haystack = [document.title, document.summary, document.body, document.author, document.owner, document.slug]
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

export function buildDocumentMetrics(documents: DocumentRecord[]): DocumentMetric[] {
  const recentUpdates = listRecentUpdates(documents);
  const mostViewed = listMostViewed(documents, 1)[0];
  const pendingReview = countByStatus(documents, "review");

  const values: Record<string, string> = {
    documents: String(documents.length),
    "recent-updates": String(recentUpdates.length),
    "most-viewed": mostViewed ? `${mostViewed.title} (${mostViewed.viewCount})` : "—",
    "pending-review": String(pendingReview)
  };

  return DOCUMENT_CENTER_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue:
      metric.id === "documents"
        ? documents.length
        : metric.id === "recent-updates"
          ? recentUpdates.length
          : metric.id === "pending-review"
            ? pendingReview
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
    owner: ""
  };
}
