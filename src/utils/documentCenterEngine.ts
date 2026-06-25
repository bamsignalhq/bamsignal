import type {
  DocumentCenterBundle,
  DocumentSearchFilters,
  InstitutionalPoliciesBundle
} from "../types/documentCenter";
import {
  buildDocumentMetrics,
  countDocumentsByCategory,
  emptyDocumentFilters,
  filterDocuments,
  findDocumentById,
  listMostViewed,
  listPendingAcknowledgements,
  listPolicyDocuments,
  listRecentUpdates,
  searchKnowledgeArticles,
  sortDocumentsByUpdatedAt
} from "./documentCenterLogic";
import {
  listDocumentAcknowledgements,
  listDocumentCenterRecords,
  listKnowledgeArticles,
  listPolicyVersions
} from "./documentCenterStore";

export { emptyDocumentFilters, listDocumentCenterRecords };

export function buildDocumentCenterBundle(
  filters: DocumentSearchFilters = emptyDocumentFilters(),
  selectedDocumentId?: string | null
): DocumentCenterBundle {
  const allDocuments = listDocumentCenterRecords();
  const knowledgeArticles = searchKnowledgeArticles(
    listKnowledgeArticles(),
    filters.query
  );
  const acknowledgements = listDocumentAcknowledgements();
  const pendingAcknowledgements = listPendingAcknowledgements(acknowledgements);
  const documents = sortDocumentsByUpdatedAt(filterDocuments(allDocuments, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildDocumentMetrics(
      allDocuments,
      knowledgeArticles.length,
      pendingAcknowledgements.length
    ),
    documents,
    knowledgeArticles,
    policyVersions: listPolicyVersions(),
    acknowledgements,
    categoryCounts: countDocumentsByCategory(allDocuments),
    recentUpdates: listRecentUpdates(allDocuments),
    mostViewed: listMostViewed(allDocuments),
    pendingAcknowledgements,
    selectedDocument: findDocumentById(documents, selectedDocumentId ?? null)
  };
}

export function buildInstitutionalPoliciesBundle(): InstitutionalPoliciesBundle {
  const allDocuments = listDocumentCenterRecords();
  const policies = listPolicyDocuments(allDocuments);
  const acknowledgements = listDocumentAcknowledgements();
  const pendingAcknowledgements = listPendingAcknowledgements(acknowledgements);

  return {
    generatedAt: new Date().toISOString(),
    policies,
    policyVersions: listPolicyVersions(),
    acknowledgements,
    pendingAcknowledgements
  };
}
