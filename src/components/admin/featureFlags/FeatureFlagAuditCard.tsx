import type { FeatureFlagAuditRecord } from "../../../types/featureFlagPlatform";

type FeatureFlagAuditCardProps = {
  audits: FeatureFlagAuditRecord[];
};

export function FeatureFlagAuditCard({ audits }: FeatureFlagAuditCardProps) {
  return (
    <section className="feature-flag-card concierge-consultant-card--glass cc-reveal">
      <header className="feature-flag-card__head">
        <h3>Audit trail</h3>
        <p>Every toggle — who changed it, when, previous value, and reason.</p>
      </header>
      <ul className="feature-flag-card__audit-list">
        {audits.map((audit) => (
          <li key={audit.id} className="feature-flag-card__audit-item">
            <div className="feature-flag-card__row">
              <strong>{audit.flagKey}</strong>
              <span>{audit.changedBy}</span>
              <span>{new Date(audit.createdAt).toLocaleString()}</span>
            </div>
            {audit.reason ? <p>{audit.reason}</p> : null}
            <pre className="feature-flag-card__audit-diff">
              {JSON.stringify({ previous: audit.previousValue, next: audit.newValue }, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </section>
  );
}
