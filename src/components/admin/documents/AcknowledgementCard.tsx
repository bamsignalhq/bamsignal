import type { DocumentAcknowledgementRecord, DocumentRecord } from "../../../types/documentCenter";

type AcknowledgementCardProps = {
  acknowledgements: DocumentAcknowledgementRecord[];
  documents: DocumentRecord[];
  pending: DocumentAcknowledgementRecord[];
};

export function AcknowledgementCard({
  acknowledgements,
  documents,
  pending
}: AcknowledgementCardProps) {
  const titleById = Object.fromEntries(documents.map((doc) => [doc.id, doc.title]));

  return (
    <section className="document-card acknowledgement-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Employee acknowledgement</h3>
        <p>
          Track who read, who acknowledged, version, and date — {pending.length} pending
          acknowledgement(s).
        </p>
      </header>
      <ul className="acknowledgement-card__list">
        {acknowledgements.map((item) => (
          <li key={item.id} className="acknowledgement-card__item">
            <div>
              <strong>{item.employeeEmail}</strong>
              <span>{titleById[item.documentId] ?? item.documentId}</span>
            </div>
            <div className="acknowledgement-card__meta">
              <span>v{item.version}</span>
              {item.readAt ? <span>Read {new Date(item.readAt).toLocaleDateString()}</span> : null}
              {item.acknowledgedAt ? (
                <span className="document-status document-status--published">Acknowledged</span>
              ) : (
                <span className="document-status document-status--review">Pending ack</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
