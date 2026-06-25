import type { ApiClientRecord } from "../../../types/apiPlatform";

type IntegrationCardProps = {
  clients: ApiClientRecord[];
};

export function IntegrationCard({ clients }: IntegrationCardProps) {
  const sorted = [...clients].sort((left, right) => left.name.localeCompare(right.name));

  return (
    <section className="api-platform-card integration-card concierge-consultant-card--glass cc-reveal">
      <header className="api-platform-card__head">
        <h3>Integrations</h3>
        <p>Registered API clients — every external integration passes through one standardized layer.</p>
      </header>
      {sorted.length ? (
        <ul className="api-platform-card__list">
          {sorted.map((client) => (
            <li key={client.id}>
              <div className="api-platform-card__row">
                <strong>{client.name}</strong>
                <span className={`integration-card__env integration-card__env--${client.environment}`}>
                  {client.environment}
                </span>
              </div>
              <p>{client.clientRef}</p>
              <div className="api-platform-card__meta">
                <span>{client.scopes.length} scopes</span>
                {client.lastUsedAt ? (
                  <span>Last used {new Date(client.lastUsedAt).toLocaleDateString()}</span>
                ) : null}
                <span>{client.active ? "Active" : "Inactive"}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="api-platform-card__empty">No API clients registered.</p>
      )}
    </section>
  );
}
