import type { EnterpriseApiCenterSummary } from "../../../types/enterpriseApiCenter";
import {
  ENTERPRISE_API_ENDPOINT_STATUS_LABELS,
  type EnterpriseApiEndpointStatusId
} from "../../../constants/enterpriseApiCenter";
import { formatEnterpriseApiSummaryLine } from "../../../utils/enterpriseApiCenterLogic";

type EnterpriseApiSummaryCardProps = {
  summary: EnterpriseApiCenterSummary;
};

export function EnterpriseApiSummaryCard({ summary }: EnterpriseApiSummaryCardProps) {
  return (
    <section className="enterprise-api-card enterprise-api-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="enterprise-api-card__head">
        <h3>API operations overview</h3>
        <p>Live endpoint health — latency, throughput, errors, and rate limits across BamSignal APIs.</p>
      </header>
      <div className="enterprise-api-summary-card__score">
        <span>Operations score</span>
        <strong>{summary.operationsScore}%</strong>
        <span
          className={`enterprise-api-summary-card__status enterprise-api-summary-card__status--${summary.healthStatus}`}
        >
          {ENTERPRISE_API_ENDPOINT_STATUS_LABELS[summary.healthStatus as EnterpriseApiEndpointStatusId] ??
            "Healthy"}
        </span>
      </div>
      <p className="enterprise-api-card__line">{formatEnterpriseApiSummaryLine(summary)}</p>
      <div className="enterprise-api-card__grid">
        <article>
          <span>Endpoints</span>
          <strong>{summary.endpointCount}</strong>
        </article>
        <article>
          <span>Healthy</span>
          <strong>{summary.healthyCount}</strong>
        </article>
        <article>
          <span>Degraded</span>
          <strong>{summary.degradedCount}</strong>
        </article>
        <article>
          <span>Requests/min</span>
          <strong>{summary.totalRequestsPerMin}</strong>
        </article>
        <article>
          <span>Avg latency</span>
          <strong>{summary.avgLatencyMs}ms</strong>
        </article>
        <article>
          <span>Failed jobs</span>
          <strong>{summary.failedJobsCount}</strong>
        </article>
      </div>
    </section>
  );
}
