import { API_DOMAIN_LABELS } from "../../../constants/apiPlatform";
import type { ApiRateLimitRecord } from "../../../types/apiPlatform";

type RateLimitCardProps = {
  rateLimits: ApiRateLimitRecord[];
};

export function RateLimitCard({ rateLimits }: RateLimitCardProps) {
  return (
    <section className="api-platform-card rate-limit-card concierge-consultant-card--glass cc-reveal">
      <header className="api-platform-card__head">
        <h3>Rate limits</h3>
        <p>Global, domain, and client-specific throttling rules.</p>
      </header>
      {rateLimits.length ? (
        <ul className="api-platform-card__list">
          {rateLimits.map((limit) => (
            <li key={limit.id}>
              <div className="api-platform-card__row">
                <strong>{limit.limitRef}</strong>
                <span className={`rate-limit-card__status${limit.active ? " is-active" : ""}`}>
                  {limit.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="api-platform-card__meta">
                <span>{limit.requestsPerMinute}/min</span>
                <span>Burst {limit.burstLimit}</span>
                {limit.domainId ? <span>{API_DOMAIN_LABELS[limit.domainId]}</span> : null}
                {limit.clientId ? <span>Client {limit.clientId}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="api-platform-card__empty">No rate limit rules configured.</p>
      )}
    </section>
  );
}
