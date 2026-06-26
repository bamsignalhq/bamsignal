import type { ObservabilityEndpointMetric } from "../../../types/productionObservability";
import { formatObservabilityResponseTime } from "../../../utils/productionObservabilityLogic";

type SlowEndpointsCardProps = {
  endpoints: ObservabilityEndpointMetric[];
};

export function SlowEndpointsCard({ endpoints }: SlowEndpointsCardProps) {
  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Slow Endpoints</h3>
        <p>Top API routes by latency, failures, and timeouts.</p>
      </header>
      <ul className="observability-card__table">
        {endpoints.map((endpoint) => (
          <li key={endpoint.id} className="observability-card__row">
            <div className="observability-card__row-main">
              <strong>
                {endpoint.method} {endpoint.path}
              </strong>
            </div>
            <span>Avg {formatObservabilityResponseTime(endpoint.avgResponseMs)}</span>
            <span>p95 {formatObservabilityResponseTime(endpoint.p95ResponseMs)}</span>
            <span>{endpoint.failureCount} failures</span>
            <span>{endpoint.timeoutCount} timeouts</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
