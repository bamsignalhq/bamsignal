import { DOCUMENT_CATEGORIES } from "../constants/documentCenter";
import { DOCUMENT_CENTER_SEED } from "../data/documentCenterSeed";
import type { DocumentRecord, DocumentSearchFilters } from "../types/documentCenter";
import type { DocumentCategoryId, DocumentStatusId } from "../constants/documentCenter";

export function listDocuments(): DocumentRecord[] {
  return [...DOCUMENT_CENTER_SEED];
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

export function filterDocuments(documents: DocumentRecord[], filters: DocumentSearchFilters): DocumentRecord[] {
  const query = filters.query.trim().toLowerCase();

  return documents.filter((document) => {
    if (filters.categoryId !== "all" && document.categoryId !== filters.categoryId) return false;
    if (filters.status !== "all" && document.status !== filters.status) return false;
    if (filters.owner && !document.owner.toLowerCase().includes(filters.owner.toLowerCase())) return false;
    if (!query) return true;

    const haystack = [
      document.title,
      document.summary,
      document.author,
      document.owner,
      document.slug
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

export function emptyDocumentFilters(): DocumentSearchFilters {
  return {
    query: "",
    categoryId: "all",
    status: "all",
    owner: ""
  };
}
