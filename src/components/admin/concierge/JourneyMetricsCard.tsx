import type { JourneyAnalyticsMetric } from "../../../types/journeyAnalytics";

type JourneyMetricsCardProps = {
  metrics: JourneyAnalyticsMetric[];
};

export function JourneyMetricsCard({ metrics }: JourneyMetricsCardProps) {
  return (
    <section className="journey-analytics-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Journey Metrics</h3>
        <p>Every number represents a real person — never revenue or conversion.</p>
      </header>
      <dl className="journey-analytics-metrics">
        {metrics.map((metric) => (
          <div key={metric.id} className="journey-analytics-metrics__item">
            <dt>{metric.label}</dt>
            <dd>{metric.count}</dd>
            <small>{metric.hint}</small>
          </div>
        ))}
      </dl>
    </section>
  );
}
