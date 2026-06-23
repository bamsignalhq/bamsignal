import { useCallback, useMemo, useState } from "react";
import { DOCUMENT_CATEGORIES, DOCUMENT_CENTER_FUTURE_KINDS } from "../../../constants/documentCenter";
import {
  DOCUMENT_CENTER_ADMIN_BRAND,
  DOCUMENT_CENTER_ADMIN_PATH
} from "../../../constants/documentCenterAdmin";
import type { DocumentCategoryId } from "../../../constants/documentCenter";
import { buildDocumentCenterBundle } from "../../../utils/documentCenterEngine";
import { emptyDocumentFilters } from "../../../utils/documentCenterLogic";
import { DocumentCard } from "./DocumentCard";
import { DocumentCategoryCard } from "./DocumentCategoryCard";
import { DocumentSearchBar } from "./DocumentSearchBar";
import { DocumentVersionCard } from "./DocumentVersionCard";
import { DocumentViewer } from "./DocumentViewer";
import { KnowledgeOverviewCard } from "./KnowledgeOverviewCard";

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
            Permanent home for institutional knowledge — policies, training, consultant guides,
            operations manuals, research reports, contracts, templates, compliance, and safety
            procedures.
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

      <section className="document-center-page__categories" aria-label="Document categories">
        {DOCUMENT_CATEGORIES.map((category) => (
          <DocumentCategoryCard
            key={category.id}
            categoryId={category.id}
            hint={category.hint}
            count={bundle.categoryCounts[category.id] ?? 0}
            active={filters.categoryId === category.id}
            onSelect={() => handleCategorySelect(category.id)}
          />
        ))}
      </section>

      <DocumentSearchBar
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
        resultCount={bundle.documents.length}
      />

      <div className="document-center-page__body">
        <section className="document-center-page__list">
          <h3>Documents</h3>
          {bundle.documents.length ? (
            bundle.documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                selected={selectedDocumentId === document.id}
                onSelect={() => setSelectedDocumentId(document.id)}
              />
            ))
          ) : (
            <p className="document-center-page__empty">No documents match the current filters.</p>
          )}
        </section>

        <div className="document-center-page__detail">
          {selectedDocument ? (
            <>
              <DocumentViewer document={selectedDocument} />
              <DocumentVersionCard
                versions={selectedDocument.versionHistory}
                currentVersion={selectedDocument.version}
              />
            </>
          ) : (
            <p className="document-center-page__empty">Select a document to view content and version history.</p>
          )}
        </div>
      </div>

      <footer className="document-center-page__future">
        <h3>Future-ready</h3>
        <p>Documented only — not implemented in this release.</p>
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
