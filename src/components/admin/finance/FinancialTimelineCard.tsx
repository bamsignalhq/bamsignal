import type { FinanceTimelineEntry } from "../../../types/financeOperations";

type FinancialTimelineCardProps = {
  timeline: FinanceTimelineEntry[];
  transactionRef: string;
};

export function FinancialTimelineCard({ timeline, transactionRef }: FinancialTimelineCardProps) {
  return (
    <section className="financial-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="financial-timeline-card__head">
        <h3>Financial timeline</h3>
        <p>{transactionRef} — append-only audit-linked history.</p>
      </header>

      {timeline.length ? (
        <ol className="financial-timeline-card__list">
          {[...timeline].reverse().map((entry) => (
            <li key={entry.id}>
              <div className="financial-timeline-card__row">
                <strong>{entry.action}</strong>
                <span>{entry.actor}</span>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              {entry.auditRef ? (
                <p className="financial-timeline-card__audit">Audit: {entry.auditRef}</p>
              ) : null}
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="financial-timeline-card__empty">No timeline entries recorded.</p>
      )}
    </section>
  );
}
