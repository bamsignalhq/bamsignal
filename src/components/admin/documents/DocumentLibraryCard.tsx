import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_STATUS_LABELS } from "../../../constants/documentCenter";
import type { DocumentRecord } from "../../../types/documentCenter";

type DocumentLibraryCardProps = {
  documents: DocumentRecord[];
  selectedDocumentId: string | null;
  onSelectDocument: (documentId: string) => void;
};

export function DocumentLibraryCard({
  documents,
  selectedDocumentId,
  onSelectDocument
}: DocumentLibraryCardProps) {
  return (
    <section className="document-card document-library-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Document library</h3>
        <p>Authoritative institutional documents — drafts, approvals, publishing, and archives.</p>
      </header>
      <ul className="document-library-card__list">
        {documents.length ? (
          documents.map((document) => (
            <li key={document.id}>
              <button
                type="button"
                className={`document-library-card__item${selectedDocumentId === document.id ? " is-selected" : ""}`}
                onClick={() => onSelectDocument(document.id)}
              >
                <strong>{document.title}</strong>
                <span>{DOCUMENT_CATEGORY_LABELS[document.categoryId]}</span>
                <span className={`document-status document-status--${document.status}`}>
                  {DOCUMENT_STATUS_LABELS[document.status]}
                </span>
                <span>v{document.version}</span>
              </button>
            </li>
          ))
        ) : (
          <li className="document-center-page__empty">No documents match the current filters.</li>
        )}
      </ul>
    </section>
  );
}
