import { API_DOMAIN_LABELS } from "../../../constants/apiPlatform";
import type { ApiCatalogEntry } from "../../../types/apiPlatform";

type ApiCatalogCardProps = {
  catalog: ApiCatalogEntry[];
};

export function ApiCatalogCard({ catalog }: ApiCatalogCardProps) {
  const sorted = [...catalog].sort((left, right) => left.path.localeCompare(right.path));

  return (
    <section className="api-platform-card api-catalog-card concierge-consultant-card--glass cc-reveal">
      <header className="api-platform-card__head">
        <h3>API catalog</h3>
        <p>Standardized endpoints across members, journey, payments, scheduling, and institute domains.</p>
      </header>
      {sorted.length ? (
        <ul className="api-platform-card__list">
          {sorted.map((entry) => (
            <li key={entry.id}>
              <div className="api-platform-card__row">
                <strong>
                  <span className="api-catalog-card__method">{entry.method}</span> {entry.path}
                </strong>
                <span className="api-catalog-card__version">{entry.version}</span>
              </div>
              <p>{entry.description}</p>
              <div className="api-platform-card__meta">
                <span>{API_DOMAIN_LABELS[entry.domainId]}</span>
                <span>{entry.catalogRef}</span>
                {entry.deprecated ? <span>Deprecated</span> : null}
                {!entry.authenticated ? <span>Public</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="api-platform-card__empty">No catalog entries in this section.</p>
      )}
    </section>
  );
}
