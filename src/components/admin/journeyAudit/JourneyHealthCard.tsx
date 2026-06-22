import { JOURNEY_HEALTH_STATUS_LABELS } from "../../../constants/journeyIntegrityAudit";
import type { JourneyHealthMetric } from "../../../types/journeyIntegrityAudit";

type JourneyHealthCardProps = {
  metrics: JourneyHealthMetric[];
  totalJourneys: number;
  overallStatus: keyof typeof JOURNEY_HEALTH_STATUS_LABELS;
};

export function JourneyHealthCard({ metrics, totalJourneys, overallStatus }: JourneyHealthCardProps) {
  return (
    <section className="journey-health-card concierge-consultant-card--glass cc-reveal">
      <header className="journey-health-card__head">
        <h3>Journey health</h3>
        <p>
          {totalJourneys} canonical journeys — overall report:{" "}
          <span className={`journey-audit-badge journey-audit-badge--${overallStatus}`}>
            {JOURNEY_HEALTH_STATUS_LABELS[overallStatus]}
          </span>
        </p>
      </header>

      <div className="journey-health-card__metrics">
        {metrics.map((metric) => (
          <article
            key={metric.status}
            className={`journey-health-card__chip journey-health-card__chip--${metric.status}`}
          >
            <p>{JOURNEY_HEALTH_STATUS_LABELS[metric.status]}</p>
            <strong>{metric.count}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
