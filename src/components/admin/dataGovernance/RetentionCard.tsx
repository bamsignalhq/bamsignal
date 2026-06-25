import type { RetentionPolicyRecord } from "../../../types/dataGovernanceCenter";

type RetentionCardProps = {
  policies: RetentionPolicyRecord[];
};

export function RetentionCard({ policies }: RetentionCardProps) {
  const sorted = [...policies].sort((left, right) => left.label.localeCompare(right.label));

  return (
    <section className="data-governance-card retention-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Retention policies</h3>
        <p>Journey records, messages, documents, audit logs, financial records, and archive policies.</p>
      </header>
      {sorted.length ? (
        <ul className="data-governance-card__list">
          {sorted.map((policy) => (
            <li key={policy.id}>
              <div className="data-governance-card__row">
                <strong>{policy.label}</strong>
                <span className={`retention-card__status${policy.active ? " is-active" : ""}`}>
                  {policy.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p>{policy.policyRef}</p>
              <div className="data-governance-card__meta">
                <span>Retain {policy.retentionDays} days</span>
                {policy.archiveAfterDays ? <span>Archive after {policy.archiveAfterDays}d</span> : null}
                {policy.legalHoldExempt ? <span>Legal hold exempt</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No retention policies on record.</p>
      )}
    </section>
  );
}
