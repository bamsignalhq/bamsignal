import type { ConfigurationMetric } from "../../../types/configurationPlatform";
import { CONFIGURATION_PLATFORM_RULES } from "../../../constants/configurationPlatform";

type ConfigurationOverviewCardProps = {
  metrics: ConfigurationMetric[];
};

export function ConfigurationOverviewCard({ metrics }: ConfigurationOverviewCardProps) {
  return (
    <section className="config-card configuration-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="config-card__head">
        <h3>Configuration overview</h3>
        <p>Centralized runtime configuration — no magic numbers, no scattered environment logic.</p>
      </header>
      <div className="configuration-overview-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="config-metric-chip">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
      <footer className="configuration-overview-card__rules">
        <h4>Governance rules</h4>
        <ul>
          {CONFIGURATION_PLATFORM_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </footer>
    </section>
  );
}
