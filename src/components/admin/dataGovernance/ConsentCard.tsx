import type { ConsentRecord } from "../../../types/dataGovernanceCenter";

type ConsentCardProps = {
  consents: ConsentRecord[];
};

export function ConsentCard({ consents }: ConsentCardProps) {
  const sorted = [...consents].sort(
    (left, right) => new Date(right.grantedAt).getTime() - new Date(left.grantedAt).getTime()
  );

  return (
    <section className="data-governance-card consent-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Consent records</h3>
        <p>Versioned consent — purpose, scope, withdrawal, and audit trail.</p>
      </header>
      {sorted.length ? (
        <ul className="data-governance-card__list">
          {sorted.map((consent) => (
            <li key={consent.id}>
              <div className="data-governance-card__row">
                <strong>{consent.consentRef}</strong>
                <span className={`consent-card__status consent-card__status--${consent.status}`}>
                  {consent.status}
                </span>
              </div>
              <p>v{consent.version} · {consent.purpose}</p>
              <p>{consent.scope}</p>
              <div className="data-governance-card__meta">
                <span>{consent.memberRef}</span>
                <span>Granted {new Date(consent.grantedAt).toLocaleDateString()}</span>
                {consent.withdrawnAt ? (
                  <span>Withdrawn {new Date(consent.withdrawnAt).toLocaleDateString()}</span>
                ) : null}
              </div>
              {consent.auditTrail.length ? (
                <ul className="consent-card__audit">
                  {consent.auditTrail.map((entry) => (
                    <li key={`${entry.at}-${entry.action}`}>
                      {new Date(entry.at).toLocaleString()} — {entry.actor}: {entry.action}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No consent records on file.</p>
      )}
    </section>
  );
}
