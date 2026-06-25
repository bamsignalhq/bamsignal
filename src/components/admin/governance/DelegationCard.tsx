import type { DelegationRecord } from "../../../types/institutionalGovernance";

type DelegationCardProps = {
  delegations: DelegationRecord[];
};

export function DelegationCard({ delegations }: DelegationCardProps) {
  return (
    <section className="governance-card delegation-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Delegations</h3>
        <p>Temporary authority with automatic expiry, revocation, and audit trail.</p>
      </header>
      <ul className="delegation-card__list">
        {delegations.map((delegation) => (
          <li key={delegation.id}>
            <strong>
              {delegation.delegatorEmail} → {delegation.delegateEmail}
            </strong>
            <span className={`governance-pill governance-pill--${delegation.status}`}>
              {delegation.status}
            </span>
            <p>
              {new Date(delegation.startsAt).toLocaleDateString()} –{" "}
              {new Date(delegation.endsAt).toLocaleDateString()}
            </p>
            <p>{delegation.permissionSlugs.join(", ")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
