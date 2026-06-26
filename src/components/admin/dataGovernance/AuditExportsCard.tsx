import type { AuditExportRecord } from "../../../types/dataGovernanceCenter";

type AuditExportsCardProps = {
  exports: AuditExportRecord[];
};

export function AuditExportsCard({ exports: auditExports }: AuditExportsCardProps) {
  const sorted = [...auditExports].sort(
    (left, right) => new Date(right.generatedAt).getTime() - new Date(left.generatedAt).getTime()
  );

  return (
    <section className="data-governance-card audit-exports-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Audit exports</h3>
        <p>Generated governance, consent, and privacy request audit packages.</p>
      </header>
      {sorted.length ? (
        <ul className="data-governance-card__list">
          {sorted.map((item) => (
            <li key={item.id}>
              <div className="data-governance-card__row">
                <strong>{item.exportRef}</strong>
                <span className="audit-exports-card__format">{item.format}</span>
              </div>
              <p>{item.scope}</p>
              <div className="data-governance-card__meta">
                <span>{item.requestedBy}</span>
                <span>{item.recordCount.toLocaleString()} records</span>
                <span>{new Date(item.generatedAt).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No audit exports generated.</p>
      )}
    </section>
  );
}
