import type { GovernanceOverviewMetric } from "../../../types/institutionalGovernance";

type InstitutionHealthCardProps = {
  metrics: GovernanceOverviewMetric[];
};

export function InstitutionHealthCard({ metrics }: InstitutionHealthCardProps) {
  const compliance = metrics.find((item) => item.id === "policy-acks");
  const approvals = metrics.find((item) => item.id === "pending-approvals");

  return (
    <section className="governance-card institution-health-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Institution health</h3>
        <p>Governance posture — policy compliance, approvals, and delegation hygiene.</p>
      </header>
      <div className="institution-health-card__grid">
        <article>
          <span>Policy compliance</span>
          <strong>{compliance?.value ?? "—"}</strong>
        </article>
        <article>
          <span>Pending approvals</span>
          <strong>{approvals?.value ?? "0"}</strong>
        </article>
        <article>
          <span>Separation of duties</span>
          <strong>Enforced</strong>
        </article>
      </div>
    </section>
  );
}
