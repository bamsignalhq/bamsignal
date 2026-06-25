import type { DataGovernanceSummary, RegionalPolicyRecord } from "../../../types/dataGovernanceCenter";

type ComplianceCardProps = {
  summary: DataGovernanceSummary;
  regionalPolicies: RegionalPolicyRecord[];
};

export function ComplianceCard({ summary, regionalPolicies }: ComplianceCardProps) {
  const active = regionalPolicies.filter((item) => item.active);

  return (
    <section className="data-governance-card compliance-card concierge-consultant-card--glass cc-reveal">
      <header className="data-governance-card__head">
        <h3>Compliance posture</h3>
        <p>Regional policies, open requests, consent stewardship, and retention coverage.</p>
      </header>
      <div className="data-governance-card__grid">
        <article>
          <span>Regional policies</span>
          <strong>{summary.regionalPolicies}</strong>
        </article>
        <article>
          <span>Open requests</span>
          <strong>{summary.openPrivacyRequests}</strong>
        </article>
        <article>
          <span>Active consents</span>
          <strong>{summary.activeConsents}</strong>
        </article>
        <article>
          <span>Withdrawn</span>
          <strong>{summary.withdrawnConsents}</strong>
        </article>
        <article>
          <span>Retention policies</span>
          <strong>{summary.activeRetentionPolicies}</strong>
        </article>
        <article>
          <span>Sensitive registers</span>
          <strong>{summary.sensitiveRegisters}</strong>
        </article>
      </div>
      {active.length ? (
        <ul className="compliance-card__regions">
          {active.map((policy) => (
            <li key={policy.id}>
              <strong>{policy.region}</strong> — {policy.framework}
              <p>{policy.description}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
