import { useCallback, useMemo, useState } from "react";
import { DOCUMENT_CENTER_FUTURE_KINDS } from "../../../constants/documentCenter";
import {
  DOCUMENT_CENTER_ADMIN_BRAND,
  DOCUMENT_CENTER_ADMIN_PATH
} from "../../../constants/documentCenterAdmin";
import type { DocumentCategoryId } from "../../../constants/documentCenter";
import { buildDocumentCenterBundle } from "../../../utils/documentCenterEngine";
import { emptyDocumentFilters } from "../../../utils/documentCenterLogic";
import { AcknowledgementCard } from "./AcknowledgementCard";
import { CategoryExplorerCard } from "./CategoryExplorerCard";
import { DocumentLibraryCard } from "./DocumentLibraryCard";
import { DocumentViewer } from "./DocumentViewer";
import { KnowledgeBaseCard } from "./KnowledgeBaseCard";
import { KnowledgeOverviewCard } from "./KnowledgeOverviewCard";
import { PolicyCard } from "./PolicyCard";
import { SearchCard } from "./SearchCard";
import { VersionHistoryCard } from "./VersionHistoryCard";

export function DocumentCenterPage() {
  const [filters, setFilters] = useState(() => emptyDocumentFilters());
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const bundle = useMemo(() => {
    void refreshKey;
    return buildDocumentCenterBundle(filters, selectedDocumentId);
  }, [filters, refreshKey, selectedDocumentId]);

  const selectedDocument =
    bundle.documents.find((document) => document.id === selectedDocumentId) ?? bundle.selectedDocument;

  const policyDocuments = bundle.documents.filter((document) => document.categoryId === "policies");

  const handleCategorySelect = useCallback((categoryId: DocumentCategoryId) => {
    setFilters((current) => ({
      ...current,
      categoryId: current.categoryId === categoryId ? "all" : categoryId
    }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(emptyDocumentFilters());
    setSelectedDocumentId(null);
  }, []);

  return (
    <div className="document-center-page">
      <header className="document-center-page__head">
        <div>
          <h2>{DOCUMENT_CENTER_ADMIN_BRAND}</h2>
          <p>
            Living documentation and authoritative source of truth for every employee — version
            history, approvals, publishing, archiving, acknowledgements, search, categories, tags,
            and related documents.
          </p>
        </div>
        <button
          type="button"
          className="concierge-consultant-btn"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh
        </button>
      </header>

      <KnowledgeOverviewCard
        metrics={bundle.metrics}
        recentUpdates={bundle.recentUpdates}
        mostViewed={bundle.mostViewed}
      />

      <SearchCard
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        resultCount={bundle.documents.length + bundle.knowledgeArticles.length}
      />

      <CategoryExplorerCard
        categoryCounts={bundle.categoryCounts}
        activeCategoryId={filters.categoryId === "all" ? "all" : filters.categoryId}
        onSelectCategory={handleCategorySelect}
      />

      <div className="document-center-page__body">
        <div className="document-center-page__column">
          <DocumentLibraryCard
            documents={bundle.documents}
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={setSelectedDocumentId}
          />
          <KnowledgeBaseCard articles={bundle.knowledgeArticles} />
          <PolicyCard policies={policyDocuments} policyVersions={bundle.policyVersions} />
        </div>

        <div className="document-center-page__column">
          {selectedDocument ? (
            <>
              <DocumentViewer document={selectedDocument} />
              <VersionHistoryCard
                versions={selectedDocument.versionHistory}
                currentVersion={selectedDocument.version}
              />
            </>
          ) : (
            <p className="document-center-page__empty">
              Select a document to view content, related documents, and version history.
            </p>
          )}
          <AcknowledgementCard
            acknowledgements={bundle.acknowledgements}
            documents={bundle.documents}
            pending={bundle.pendingAcknowledgements}
          />
        </div>
      </div>

      <footer className="document-center-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — every publish, update, archive, and acknowledgement is audit logged.</p>
        <ul>
          {DOCUMENT_CENTER_FUTURE_KINDS.map((item) => (
            <li key={item.id}>{item.label}</li>
          ))}
        </ul>
        <p>Admin path: {DOCUMENT_CENTER_ADMIN_PATH}</p>
      </footer>
    </div>
  );
}
