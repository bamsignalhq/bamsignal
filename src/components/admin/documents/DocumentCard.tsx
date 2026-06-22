import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_STATUS_LABELS
} from "../../../constants/documentCenter";
import type { DocumentRecord } from "../../../types/documentCenter";

type DocumentCardProps = {
  document: DocumentRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function DocumentCard({ document, selected = false, onSelect }: DocumentCardProps) {
  const content = (
    <>
      <div className="document-card__head">
        <p className="document-card__category">{DOCUMENT_CATEGORY_LABELS[document.categoryId]}</p>
        <span className={`document-card__status document-card__status--${document.status}`}>
          {DOCUMENT_STATUS_LABELS[document.status]}
        </span>
      </div>
      <h3>{document.title}</h3>
      <p>{document.summary}</p>
      <dl className="document-card__meta">
        <div>
          <dt>Version</dt>
          <dd>v{document.version}</dd>
        </div>
        <div>
          <dt>Author</dt>
          <dd>{document.author}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{document.owner}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{new Date(document.updatedAt).toLocaleDateString()}</dd>
        </div>
      </dl>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`document-card document-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="document-card">{content}</article>;
}
