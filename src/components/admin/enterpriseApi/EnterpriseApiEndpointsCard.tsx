import {
  ENTERPRISE_API_AUTH_LABELS,
  ENTERPRISE_API_ENDPOINT_STATUS_LABELS,
  type EnterpriseApiEndpointStatusId
} from "../../../constants/enterpriseApiCenter";
import type { EnterpriseApiEndpoint } from "../../../types/enterpriseApiCenter";

type EnterpriseApiEndpointsCardProps = {
  endpoints: EnterpriseApiEndpoint[];
  selectedEndpointId: string | null;
  onSelect: (endpointId: string) => void;
};

export function EnterpriseApiEndpointsCard({
  endpoints,
  selectedEndpointId,
  onSelect
}: EnterpriseApiEndpointsCardProps) {
  return (
    <section className="enterprise-api-card enterprise-api-endpoints-card concierge-consultant-card--glass cc-reveal">
      <header className="enterprise-api-card__head">
        <h3>All endpoints</h3>
        <p>Status, latency, requests, errors, rate limits, authentication, and payload size.</p>
      </header>
      <div className="enterprise-api-endpoints-card__table-wrap">
        <table className="enterprise-api-endpoints-card__table">
          <thead>
            <tr>
              <th>Endpoint</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Requests</th>
              <th>Errors</th>
              <th>Rate limit</th>
              <th>Auth</th>
              <th>Payload</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((item) => (
              <tr
                key={item.id}
                className={selectedEndpointId === item.id ? "is-selected" : ""}
                onClick={() => onSelect(item.id)}
              >
                <td>
                  <span className="enterprise-api-endpoints-card__method">{item.method}</span>
                  <span>{item.path}</span>
                </td>
                <td>
                  <span
                    className={`enterprise-api-endpoints-card__badge enterprise-api-endpoints-card__badge--${item.status}`}
                  >
                    {ENTERPRISE_API_ENDPOINT_STATUS_LABELS[item.status]}
                  </span>
                </td>
                <td>{item.latencyMs}ms</td>
                <td>{item.requestsPerMin}/min</td>
                <td>
                  {item.errorCount} ({item.errorRate}%)
                </td>
                <td>{item.rateLimitPerMin}/min</td>
                <td>{ENTERPRISE_API_AUTH_LABELS[item.authentication]}</td>
                <td>{item.payloadSizeKb}KB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
