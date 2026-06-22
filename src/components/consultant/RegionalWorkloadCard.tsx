import { REGIONAL_TEAM_METRIC_LABELS } from "../../constants/regionalConsultantTeams";
import type { RegionalTeamMetrics } from "../../types/regionalConsultantTeams";

type RegionalWorkloadCardProps = {
  regionLabel: string;
  metrics: RegionalTeamMetrics;
};

export function RegionalWorkloadCard({ regionLabel, metrics }: RegionalWorkloadCardProps) {
  const entries = Object.entries(REGIONAL_TEAM_METRIC_LABELS) as [keyof RegionalTeamMetrics, string][];

  return (
    <section className="regional-workload-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{regionLabel} Metrics</h3>
        <p>Regional journey health — members, relationships, and legacy families.</p>
      </header>
      <dl className="regional-workload-card__grid">
        {entries.map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{metrics[key]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
