import type { DocumentAuditActionId } from "../constants/documentCenter";
import {
  DOCUMENT_ACKNOWLEDGEMENT_SEED,
  DOCUMENT_CENTER_SEED,
  KNOWLEDGE_ARTICLE_SEED,
  POLICY_VERSION_SEED
} from "../data/documentCenterSeed";
import type {
  DocumentAcknowledgementRecord,
  DocumentRecord,
  KnowledgeArticleRecord
} from "../types/documentCenter";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import { recordAcknowledgement } from "./documentCenterLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.documentCenter.v3";

type DocumentCenterStoreState = {
  documents: DocumentRecord[];
  knowledgeArticles: KnowledgeArticleRecord[];
  policyVersions: typeof POLICY_VERSION_SEED;
  acknowledgements: DocumentAcknowledgementRecord[];
  updatedAt: string;
};

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

function defaultState(): DocumentCenterStoreState {
  return {
    documents: DOCUMENT_CENTER_SEED.map(normalizeDocument),
    knowledgeArticles: [...KNOWLEDGE_ARTICLE_SEED],
    policyVersions: [...POLICY_VERSION_SEED],
    acknowledgements: [...DOCUMENT_ACKNOWLEDGEMENT_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): DocumentCenterStoreState {
  const stored = readJson<DocumentCenterStoreState>(STORAGE_KEY, defaultState());
  if (!stored?.documents?.length) return defaultState();
  return {
    ...defaultState(),
    ...stored,
    documents: stored.documents.map(normalizeDocument),
    knowledgeArticles: stored.knowledgeArticles?.length
      ? stored.knowledgeArticles
      : KNOWLEDGE_ARTICLE_SEED,
    policyVersions: stored.policyVersions?.length ? stored.policyVersions : POLICY_VERSION_SEED,
    acknowledgements: stored.acknowledgements?.length
      ? stored.acknowledgements
      : DOCUMENT_ACKNOWLEDGEMENT_SEED
  };
}

function saveState(state: DocumentCenterStoreState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logDocumentAudit(action: DocumentAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "document-center",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listDocumentCenterRecords() {
  return loadState().documents;
}

export function listKnowledgeArticles() {
  return loadState().knowledgeArticles;
}

export function listPolicyVersions() {
  return loadState().policyVersions;
}

export function listDocumentAcknowledgements() {
  return loadState().acknowledgements;
}

export function publishDocument(documentId: string, actor: string): DocumentRecord | null {
  const state = loadState();
  const index = state.documents.findIndex((item) => item.id === documentId);
  if (index < 0) return null;
  const doc = state.documents[index];
  state.documents[index] = {
    ...doc,
    status: "published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveState(state);
  logDocumentAudit("document-published", `${doc.slug} v${doc.version} by ${actor}`, doc.slug);
  return state.documents[index];
}

export function archiveDocument(documentId: string, actor: string): DocumentRecord | null {
  const state = loadState();
  const index = state.documents.findIndex((item) => item.id === documentId);
  if (index < 0) return null;
  const doc = state.documents[index];
  state.documents[index] = {
    ...doc,
    status: "archived",
    archivedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveState(state);
  logDocumentAudit("document-archived", `${doc.slug} by ${actor}`, doc.slug);
  return state.documents[index];
}

export function acknowledgeDocument(
  documentId: string,
  employeeEmail: string,
  version: string
): DocumentAcknowledgementRecord | null {
  const state = loadState();
  const result = recordAcknowledgement(state.acknowledgements, {
    documentId,
    employeeEmail,
    version
  });
  state.acknowledgements = result.acknowledgements;
  saveState(state);
  const record = result.acknowledgements.find(
    (item) =>
      item.documentId === documentId &&
      item.employeeEmail === employeeEmail &&
      item.version === version
  );
  if (record) {
    logDocumentAudit(
      "document-acknowledged",
      `${employeeEmail} acknowledged ${documentId} v${version}`,
      documentId
    );
  }
  return record ?? null;
}
