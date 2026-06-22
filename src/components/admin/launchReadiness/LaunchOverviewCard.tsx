import { LAUNCH_READINESS_STATUS_LABELS } from "../../../constants/launchReadiness";
import type { LaunchReadinessMetric } from "../../../types/launchReadiness";
import type { LaunchReadinessStatusId } from "../../../constants/launchReadiness";

type LaunchOverviewCardProps = {
  metrics: LaunchReadinessMetric[];
  overallStatus: LaunchReadinessStatusId;
  generatedAt: string;
};

export function LaunchOverviewCard({ metrics, overallStatus, generatedAt }: LaunchOverviewCardProps) {
  return (
    <section className="launch-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-overview-card__head">
        <h3>Launch overview</h3>
        <p>
          Read-only institutional readiness — overall:{" "}
          <span className={`launch-readiness-badge launch-readiness-badge--${overallStatus}`}>
            {LAUNCH_READINESS_STATUS_LABELS[overallStatus]}
          </span>
        </p>
      </header>

      <div className="launch-overview-card__metrics">
        {metrics.map((metric) => (
          <article key={metric.id} className="launch-overview-card__chip">
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>

      <p className="launch-overview-card__meta">Report generated {new Date(generatedAt).toLocaleString()}</p>
    </section>
  );
}
