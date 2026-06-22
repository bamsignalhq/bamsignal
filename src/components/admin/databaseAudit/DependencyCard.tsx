import { DATABASE_DOMAIN_LABELS, DATABASE_HEALTH_STATUS_LABELS } from "../../../constants/databaseAudit";
import type { LocalStorageDependency } from "../../../types/databaseAudit";

type DependencyCardProps = {
  dependencies: LocalStorageDependency[];
};

export function DependencyCard({ dependencies }: DependencyCardProps) {
  return (
    <section className="dependency-card concierge-consultant-card--glass cc-reveal">
      <header className="dependency-card__head">
        <h3>localStorage dependencies</h3>
        <p>Admin and concierge engines still reading or writing browser storage during migration.</p>
      </header>

      <ul className="dependency-card__list">
        {dependencies.map((dependency) => (
          <li key={dependency.id}>
            <div className="dependency-card__item-head">
              <strong><code>{dependency.storageKey}</code></strong>
              <span>{DATABASE_HEALTH_STATUS_LABELS[dependency.health]}</span>
            </div>
            <p>
              {DATABASE_DOMAIN_LABELS[dependency.domainId]} · {dependency.engine}
              {dependency.expectedTable ? ` → ${dependency.expectedTable}` : ""}
            </p>
            {dependency.note ? <p className="dependency-card__note">{dependency.note}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
