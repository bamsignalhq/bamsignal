/**
 * Institutional Policy & Documentation Center™ — server-side logic.
 */

import { query, isDatabaseReady } from "../db.js";

export const DOCUMENT_CENTER_DB_TABLES = [
  "documents",
  "document_versions",
  "document_categories",
  "document_acknowledgements",
  "policy_versions",
  "knowledge_articles"
];

export function getDocumentCenterDatabaseTableManifest() {
  return DOCUMENT_CENTER_DB_TABLES.map((tableName) => ({
    tableName,
    domain: "documents"
  }));
}

export function canAccessDocumentCenter(permissions = []) {
  return permissions.includes("ManageDocuments") || permissions.includes("ViewArchives");
}

export function validateDocumentPublish(document) {
  if (!document?.title?.trim()) return { ok: false, reason: "missing-title" };
  if (!document?.version?.trim()) return { ok: false, reason: "missing-version" };
  if (!["approved", "published"].includes(document.status) && document.status !== "review") {
    return { ok: false, reason: "invalid-status-for-publish" };
  }
  return { ok: true };
}

export function appendDocumentVersion(document, entry) {
  const history = Array.isArray(document.versionHistory) ? [...document.versionHistory] : [];
  history.push({
    version: entry.version,
    updatedAt: entry.updatedAt ?? new Date().toISOString(),
    author: entry.author ?? document.author,
    note: entry.note ?? ""
  });
  return {
    ...document,
    version: entry.version ?? document.version,
    versionHistory: history,
    updatedAt: new Date().toISOString()
  };
}

export function recordAcknowledgement(acknowledgements, input) {
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

export function searchKnowledgeArticles(articles, queryText = "") {
  const query = String(queryText).trim().toLowerCase();
  if (!query) return articles;
  return articles.filter((article) => {
    const haystack = [
      article.title,
      article.bodyMarkdown,
      article.slug,
      ...(article.tags ?? [])
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export async function listDocuments(limit = 100) {
  if (!isDatabaseReady()) return [];
  const result = await query(`select * from documents order by updated_at desc limit $1`, [limit]);
  return result.rows ?? [];
}

export async function listKnowledgeArticles(limit = 100) {
  if (!isDatabaseReady()) return [];
  const result = await query(
    `select * from knowledge_articles order by updated_at desc limit $1`,
    [limit]
  );
  return result.rows ?? [];
}
