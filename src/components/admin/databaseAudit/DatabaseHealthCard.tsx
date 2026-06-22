import { DATABASE_HEALTH_STATUS_LABELS } from "../../../constants/databaseAudit";
import type { DatabaseHealthMetric } from "../../../types/databaseAudit";

type DatabaseHealthCardProps = {
  metrics: DatabaseHealthMetric[];
  totalTables: number;
};

export function DatabaseHealthCard({ metrics, totalTables }: DatabaseHealthCardProps) {
  return (
    <section className="database-health-card concierge-consultant-card--glass cc-reveal">
      <header className="database-health-card__head">
        <h3>Database health</h3>
        <p>{totalTables} tables inventoried across baseline schema, concierge persistence, and migration gaps.</p>
      </header>

      <div className="database-health-card__metrics">
        {metrics.map((metric) => (
          <article
            key={metric.status}
            className={`database-health-card__chip database-health-card__chip--${metric.status}`}
          >
            <p>{DATABASE_HEALTH_STATUS_LABELS[metric.status]}</p>
            <strong>{metric.count}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
