import type { LegalHoldRecord } from "../../../types/dataGovernanceCenter";

type LegalHoldsCardProps = {
  holds: LegalHoldRecord[];
};

export function LegalHoldsCard({ holds }: LegalHoldsCardProps) {
  const sorted = [...holds].sort(
    (left, right) => new Date(right.placedAt).getTime() - new Date(left.placedAt).getTime()
  );

  return (
    <section className="data-governance-card legal-holds-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Legal holds</h3>
        <p>Preserve member data during regulatory inquiries, litigation, or disputes.</p>
      </header>
      {sorted.length ? (
        <ul className="data-governance-card__list">
          {sorted.map((hold) => (
            <li key={hold.id}>
              <div className="data-governance-card__row">
                <strong>{hold.holdRef}</strong>
                <span className={`legal-holds-card__status${hold.active ? " is-active" : ""}`}>
                  {hold.active ? "Active" : "Released"}
                </span>
              </div>
              <p>{hold.reason}</p>
              <div className="data-governance-card__meta">
                <span>{hold.memberRef}</span>
                <span>Placed by {hold.placedBy}</span>
                <span>{new Date(hold.placedAt).toLocaleDateString()}</span>
                {hold.expiresAt ? (
                  <span>Expires {new Date(hold.expiresAt).toLocaleDateString()}</span>
                ) : (
                  <span>No expiry</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="data-governance-card__empty">No legal holds on record.</p>
      )}
    </section>
  );
}
