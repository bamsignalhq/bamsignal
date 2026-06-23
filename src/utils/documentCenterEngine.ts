import { DOCUMENT_CENTER_SEED } from "../data/documentCenterSeed";
import type { DocumentCenterBundle, DocumentRecord, DocumentSearchFilters } from "../types/documentCenter";
import {
  buildDocumentMetrics,
  countDocumentsByCategory,
  emptyDocumentFilters,
  filterDocuments,
  findDocumentById,
  listMostViewed,
  listRecentUpdates,
  sortDocumentsByUpdatedAt
} from "./documentCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.documentCenter.v2";

type DocumentCenterState = {
  documents: DocumentRecord[];
  updatedAt: string;
};

function normalizeDocument(document: DocumentRecord): DocumentRecord {
  return {
    ...document,
    body: document.body ?? document.summary,
    viewCount: document.viewCount ?? 0,
    permissions: document.permissions ?? ["view"]
  };
}

function defaultState(): DocumentCenterState {
  return {
    documents: DOCUMENT_CENTER_SEED.map(normalizeDocument),
    updatedAt: new Date().toISOString()
  };
}

function loadState(): DocumentCenterState {
  const stored = readJson<DocumentCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.documents?.length) return defaultState();
  return {
    ...stored,
    documents: stored.documents.map(normalizeDocument)
  };
}

export function listDocumentCenterRecords(): DocumentRecord[] {
  return loadState().documents;
}

export function buildDocumentCenterBundle(
  filters: DocumentSearchFilters = emptyDocumentFilters(),
  selectedDocumentId?: string | null
): DocumentCenterBundle {
  const allDocuments = listDocumentCenterRecords();
  const documents = sortDocumentsByUpdatedAt(filterDocuments(allDocuments, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildDocumentMetrics(allDocuments),
    documents,
    categoryCounts: countDocumentsByCategory(allDocuments),
    recentUpdates: listRecentUpdates(allDocuments),
    mostViewed: listMostViewed(allDocuments),
    selectedDocument: findDocumentById(documents, selectedDocumentId ?? null)
  };
}
