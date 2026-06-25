import { API_KEY_STATUS_LABELS } from "../../../constants/apiPlatform";
import type { ApiKeyRecord, ApiPlatformSummary } from "../../../types/apiPlatform";

type SecurityCardProps = {
  summary: ApiPlatformSummary;
  keys: ApiKeyRecord[];
};

export function SecurityCard({ summary, keys }: SecurityCardProps) {
  return (
    <section className="api-platform-card security-card concierge-consultant-card--glass cc-reveal">
      <header className="api-platform-card__head">
        <h3>API security</h3>
        <p>Keys, scopes, rotation, expiration, audit, and IP restrictions.</p>
      </header>
      <div className="api-platform-card__grid">
        <article>
          <span>Active keys</span>
          <strong>{summary.activeKeys}</strong>
        </article>
        <article>
          <span>Active clients</span>
          <strong>{summary.activeClients}</strong>
        </article>
        <article>
          <span>Active webhooks</span>
          <strong>{summary.activeWebhooks}</strong>
        </article>
        <article>
          <span>Rate rules</span>
          <strong>{summary.rateLimitRules}</strong>
        </article>
      </div>
      {keys.length ? (
        <ul className="api-platform-card__list">
          {keys.map((key) => (
            <li key={key.id}>
              <div className="api-platform-card__row">
                <strong>{key.keyRef}</strong>
                <span className={`security-card__status security-card__status--${key.status}`}>
                  {API_KEY_STATUS_LABELS[key.status]}
                </span>
              </div>
              <p>{key.clientName}</p>
              <div className="api-platform-card__meta">
                <span>{key.scopes.join(", ")}</span>
                {key.expiresAt ? (
                  <span>Expires {new Date(key.expiresAt).toLocaleDateString()}</span>
                ) : null}
                {key.ipRestrictions.length ? (
                  <span>IP: {key.ipRestrictions.join(", ")}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="api-platform-card__empty">No API keys on record.</p>
      )}
    </section>
  );
}
