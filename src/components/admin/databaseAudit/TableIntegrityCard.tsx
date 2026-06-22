import { DATABASE_HEALTH_STATUS_LABELS } from "../../../constants/databaseAudit";
import type { DatabaseTableRecord } from "../../../types/databaseAudit";

type TableIntegrityCardProps = {
  tables: DatabaseTableRecord[];
  duplicates: DatabaseTableRecord[];
  missing: DatabaseTableRecord[];
};

export function TableIntegrityCard({ tables, duplicates, missing }: TableIntegrityCardProps) {
  const flagged = [...duplicates, ...missing, ...tables.filter((table) => table.health !== "healthy")];
  const unique = Array.from(new Map(flagged.map((item) => [item.id, item])).values());

  return (
    <section className="table-integrity-card concierge-consultant-card--glass cc-reveal">
      <header className="table-integrity-card__head">
        <h3>Table integrity</h3>
        <p>Missing tables, duplicate families, indexes, and constraints from migration manifests.</p>
      </header>

      {unique.length ? (
        <ul className="table-integrity-card__list">
          {unique.slice(0, 24).map((table) => (
            <li key={table.id}>
              <div className="table-integrity-card__item-head">
                <strong><code>{table.tableName}</code></strong>
                <span>{DATABASE_HEALTH_STATUS_LABELS[table.health]}</span>
              </div>
              <p>
                {table.migrationRef}
                {table.note ? ` — ${table.note}` : ""}
              </p>
              {table.indexes.length ? (
                <p className="table-integrity-card__meta">Indexes: {table.indexes.join(", ")}</p>
              ) : null}
              {table.constraints.length ? (
                <p className="table-integrity-card__meta">Constraints: {table.constraints.join(", ")}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="table-integrity-card__empty">No integrity issues flagged in the current manifest.</p>
      )}
    </section>
  );
}
