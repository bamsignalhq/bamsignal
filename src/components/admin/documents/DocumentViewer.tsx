import {
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_PERMISSION_LABELS,
  DOCUMENT_STATUS_LABELS
} from "../../../constants/documentCenter";
import type { DocumentRecord } from "../../../types/documentCenter";

type DocumentViewerProps = {
  document: DocumentRecord;
};

export function DocumentViewer({ document }: DocumentViewerProps) {
  return (
    <section className="document-viewer concierge-consultant-card--glass cc-reveal" aria-label="Document viewer">
      <header className="document-viewer__head">
        <p className="document-viewer__category">{DOCUMENT_CATEGORY_LABELS[document.categoryId]}</p>
        <span className={`document-viewer__status document-viewer__status--${document.status}`}>
          {DOCUMENT_STATUS_LABELS[document.status]}
        </span>
      </header>

      <h3>{document.title}</h3>
      <p className="document-viewer__summary">{document.summary}</p>
      <div className="document-viewer__body">
        <p>{document.body}</p>
      </div>

      <dl className="document-viewer__meta">
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
          <dt>Views</dt>
          <dd>{document.viewCount}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{new Date(document.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{new Date(document.updatedAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Slug</dt>
          <dd>{document.slug}</dd>
        </div>
      </dl>

      {document.tags?.length ? (
        <div className="document-viewer__tags">
          <h4>Tags</h4>
          <div className="document-tags">
            {document.tags.map((tag) => (
              <span key={tag} className="document-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {document.relatedDocumentIds?.length ? (
        <div className="document-viewer__related">
          <h4>Related documents</h4>
          <ul>
            {document.relatedDocumentIds.map((relatedId) => (
              <li key={relatedId}>{relatedId}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="document-viewer__permissions">
        <h4>Permissions</h4>
        <ul>
          {document.permissions.map((permission) => (
            <li key={permission}>{DOCUMENT_PERMISSION_LABELS[permission]}</li>
          ))}
        </ul>
      </div>

      {document.approval ? (
        <footer className="document-viewer__approval">
          <p>
            Approved by {document.approval.approvedBy} on{" "}
            {new Date(document.approval.approvedAt).toLocaleDateString()}
          </p>
          {document.approval.note ? <p>{document.approval.note}</p> : null}
        </footer>
      ) : document.status !== "archived" ? (
        <p className="document-viewer__pending">
          Pending approval — document in {DOCUMENT_STATUS_LABELS[document.status]}.
        </p>
      ) : null}
    </section>
  );
}
