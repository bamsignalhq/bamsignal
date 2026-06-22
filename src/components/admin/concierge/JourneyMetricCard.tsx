import type { JourneyIntelligenceMetric } from "../../../types/journeyIntelligence";

type JourneyMetricCardProps = {
  metrics: JourneyIntelligenceMetric[];
};

export function JourneyMetricCard({ metrics }: JourneyMetricCardProps) {
  return (
    <section className="journey-intelligence-card journey-metric-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Journey metrics</h3>
        <p>Every number represents a real person — never revenue or conversion.</p>
      </header>
      <dl className="journey-intelligence-metrics">
        {metrics.map((metric) => (
          <div key={metric.id} className="journey-intelligence-metrics__item">
            <dt>{metric.label}</dt>
            <dd>{metric.count}</dd>
            <small>{metric.hint}</small>
          </div>
        ))}
      </dl>
    </section>
  );
}
