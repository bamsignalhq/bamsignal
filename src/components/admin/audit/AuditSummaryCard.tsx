import type { AuditActionSummary } from "../../../types/auditCenter";

type AuditSummaryCardProps = {
  summaries: AuditActionSummary[];
};

export function AuditSummaryCard({ summaries }: AuditSummaryCardProps) {
  return (
    <section className="audit-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="audit-summary-card__head">
        <h3>Audit summary</h3>
        <p>Event counts by action for the filtered view.</p>
      </header>

      {summaries.length ? (
        <div className="audit-summary-card__list">
          {summaries.map((item) => (
            <div key={item.action} className="audit-summary-row">
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="audit-summary-card__empty">No summary data for current filters.</p>
      )}
    </section>
  );
}
