import type { GovernanceOverviewMetric } from "../../../types/institutionalGovernance";

type GovernanceOverviewCardProps = {
  metrics: GovernanceOverviewMetric[];
  effectivePermissionCount: number;
};

export function GovernanceOverviewCard({
  metrics,
  effectivePermissionCount
}: GovernanceOverviewCardProps) {
  return (
    <section className="governance-card governance-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Governance overview</h3>
        <p>Constitutional authority layer — single source of truth for institutional permissions.</p>
      </header>
      <div className="governance-overview-card__grid">
        {metrics.map((metric) => (
          <article key={metric.id} className="governance-metric">
            <span className="governance-metric__label">{metric.label}</span>
            <strong className="governance-metric__value">{metric.value}</strong>
            {metric.hint ? <span className="governance-metric__hint">{metric.hint}</span> : null}
          </article>
        ))}
        <article className="governance-metric">
          <span className="governance-metric__label">Your effective permissions</span>
          <strong className="governance-metric__value">{effectivePermissionCount}</strong>
        </article>
      </div>
    </section>
  );
}
