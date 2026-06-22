import { DOCUMENT_CENTER_SEED } from "../data/documentCenterSeed";
import type { DocumentCenterBundle, DocumentRecord, DocumentSearchFilters } from "../types/documentCenter";
import {
  countDocumentsByCategory,
  emptyDocumentFilters,
  filterDocuments,
  findDocumentById,
  listDocuments,
  sortDocumentsByUpdatedAt
} from "./documentCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.documentCenter.v1";

type DocumentCenterState = {
  documents: DocumentRecord[];
  updatedAt: string;
};

function defaultState(): DocumentCenterState {
  return {
    documents: [...DOCUMENT_CENTER_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): DocumentCenterState {
  const stored = readJson<DocumentCenterState>(STORAGE_KEY, defaultState());
  if (!stored?.documents?.length) return defaultState();
  return stored;
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
    documents,
    categoryCounts: countDocumentsByCategory(allDocuments),
    selectedDocument: findDocumentById(documents, selectedDocumentId ?? null)
  };
}
