import { GOVERNANCE_AUDIT_ACTION_LABELS } from "../../../constants/dataGovernanceCenter";
import type { GovernanceAuditRecord } from "../../../types/dataGovernanceCenter";

type GovernanceAuditCardProps = {
  records: GovernanceAuditRecord[];
};

export function GovernanceAuditCard({ records }: GovernanceAuditCardProps) {
  const sorted = [...records].sort(
    (left, right) => new Date(right.at).getTime() - new Date(left.at).getTime()
  );

  return (
    <section className="data-governance-card governance-audit-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Governance audit</h3>
        <p>Who accessed, exported, deleted, and approved governance operations.</p>
      </header>
      {sorted.length ? (
        <ul className="data-governance-card__list">
          {sorted.map((record) => (
            <li key={record.id}>
              <div className="data-governance-card__row">
                <strong>{GOVERNANCE_AUDIT_ACTION_LABELS[record.action]}</strong>
                <span className={`governance-audit-card__action governance-audit-card__action--${record.action}`}>
                  {record.actor}
                </span>
              </div>
              <p>{record.detail}</p>
              <div className="data-governance-card__meta">
                <span>{record.target}</span>
                <span>{new Date(record.at).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No governance audit events recorded.</p>
      )}
    </section>
  );
}
