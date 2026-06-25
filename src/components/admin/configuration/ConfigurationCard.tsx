import type { ConfigurationMetric } from "../../../types/configurationPlatform";

type ConfigurationCardProps = {
  metrics: ConfigurationMetric[];
  pendingApprovals: number;
};

export function ConfigurationCard({ metrics, pendingApprovals }: ConfigurationCardProps) {
  return (
    <section className="config-card configuration-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Configuration</h3>
        <p>
          No critical business rule should require developers to edit code. Operations configures
          the institution safely.
        </p>
      </header>
      <div className="configuration-card__grid">
        {metrics.map((metric) => (
          <article key={metric.id}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
      {pendingApprovals > 0 ? (
        <p className="configuration-card__pending">
          {pendingApprovals} change{pendingApprovals === 1 ? "" : "s"} awaiting approval
        </p>
      ) : null}
    </section>
  );
}
