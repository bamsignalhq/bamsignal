import type { ContinuityOverviewMetric } from "../../../types/businessContinuity";

type IncidentOverviewCardProps = {
  metrics: ContinuityOverviewMetric[];
};

export function IncidentOverviewCard({ metrics }: IncidentOverviewCardProps) {
  return (
    <section className="continuity-card continuity-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Incident overview</h3>
        <p>Institutional continuity snapshot — open incidents, provider health, and backup posture.</p>
      </header>
      <div className="continuity-overview-card__grid">
        {metrics.map((metric) => (
          <article
            key={metric.id}
            className={`continuity-metric${metric.tone ? ` continuity-metric--${metric.tone}` : ""}`}
          >
            <span className="continuity-metric__label">{metric.label}</span>
            <strong className="continuity-metric__value">{metric.value}</strong>
            {metric.hint ? <span className="continuity-metric__hint">{metric.hint}</span> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
