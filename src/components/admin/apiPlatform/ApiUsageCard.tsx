import { API_DOMAIN_LABELS } from "../../../constants/apiPlatform";
import type { ApiPlatformSummary, ApiUsageSnapshot } from "../../../types/apiPlatform";
import { formatApiPlatformSummaryLine } from "../../../utils/apiPlatformLogic";

type ApiUsageCardProps = {
  summary: ApiPlatformSummary;
  usage: ApiUsageSnapshot[];
};

export function ApiUsageCard({ summary, usage }: ApiUsageCardProps) {
  const sorted = [...usage].sort((left, right) => right.requestCount - left.requestCount);

  return (
    <section className="api-platform-card api-usage-card concierge-consultant-card--glass cc-reveal">
      <header className="api-platform-card__head">
        <h3>API usage</h3>
        <p>Request volume, error rates, and latency by domain.</p>
      </header>
      <p className="api-platform-card__line">{formatApiPlatformSummaryLine(summary)}</p>
      <div className="api-platform-card__grid">
        <article>
          <span>Requests (24h)</span>
          <strong>{summary.totalRequests24h.toLocaleString()}</strong>
        </article>
        <article>
          <span>Errors (24h)</span>
          <strong>{summary.totalErrors24h}</strong>
        </article>
      </div>
      {sorted.length ? (
        <ul className="api-platform-card__list">
          {sorted.map((snapshot) => (
            <li key={snapshot.id}>
              <div className="api-platform-card__row">
                <strong>{API_DOMAIN_LABELS[snapshot.domainId]}</strong>
                <span>{snapshot.requestCount.toLocaleString()} req</span>
              </div>
              <div className="api-platform-card__meta">
                <span>{snapshot.errorCount} errors</span>
                <span>{snapshot.avgLatencyMs}ms avg</span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
