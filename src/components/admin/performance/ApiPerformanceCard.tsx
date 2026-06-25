import {
  PERFORMANCE_HEALTH_STATUS_LABELS,
  PERFORMANCE_METRIC_LABELS
} from "../../../constants/performanceCenter";
import type { PerformanceApiProfile } from "../../../types/performanceCenter";

type ApiPerformanceCardProps = {
  profiles: PerformanceApiProfile[];
};

export function ApiPerformanceCard({ profiles }: ApiPerformanceCardProps) {
  return (
    <section className="performance-center-card api-performance-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>API performance</h3>
        <p>Throughput, latency percentiles, and error rates by endpoint.</p>
      </header>
      {profiles.length ? (
        <ul className="performance-center-card__list">
          {profiles.map((item) => (
            <li key={item.id}>
              <div className="performance-center-card__row">
                <strong>
                  <span className="performance-center-card__method">{item.method}</span> {item.path}
                </strong>
                <span
                  className={`performance-center-card__badge performance-center-card__badge--${item.status}`}
                >
                  {PERFORMANCE_HEALTH_STATUS_LABELS[item.status]}
                </span>
              </div>
              <div className="performance-center-card__meta">
                <span>Avg {item.avgResponseMs}ms</span>
                <span>P95 {item.p95Ms}ms</span>
                <span>P99 {item.p99Ms}ms</span>
                <span>{item.throughputPerMin} rpm</span>
                <span>{item.errorRate}% errors</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="performance-center-card__empty">No API profiles in this section.</p>
      )}
      <p className="performance-center-card__footnote">
        Tracking {PERFORMANCE_METRIC_LABELS["api-throughput"]},{" "}
        {PERFORMANCE_METRIC_LABELS["avg-response-time"]}, {PERFORMANCE_METRIC_LABELS.p95},{" "}
        {PERFORMANCE_METRIC_LABELS.p99}
      </p>
    </section>
  );
}
