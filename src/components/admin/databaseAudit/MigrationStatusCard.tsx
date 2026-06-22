import { DATABASE_DOMAIN_LABELS, DATABASE_HEALTH_STATUS_LABELS } from "../../../constants/databaseAudit";
import type { MigrationGap } from "../../../types/databaseAudit";

type MigrationStatusCardProps = {
  gaps: MigrationGap[];
};

export function MigrationStatusCard({ gaps }: MigrationStatusCardProps) {
  return (
    <section className="migration-status-card concierge-consultant-card--glass cc-reveal">
      <header className="migration-status-card__head">
        <h3>Migration status by domain</h3>
        <p>Consultants through Finance — Postgres vs localStorage certainty.</p>
      </header>

      <div className="migration-status-card__table" role="table" aria-label="Migration status">
        <div className="migration-status-card__row migration-status-card__row--head" role="row">
          <span role="columnheader">Domain</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Tables</span>
          <span role="columnheader">localStorage</span>
        </div>
        {gaps.map((gap) => (
          <div key={gap.id} className="migration-status-card__row" role="row">
            <span role="cell">{DATABASE_DOMAIN_LABELS[gap.domainId]}</span>
            <span role="cell">{DATABASE_HEALTH_STATUS_LABELS[gap.status]}</span>
            <span role="cell">{gap.expectedTables.length || "—"}</span>
            <span role="cell">{gap.localStorageKeys.length || "—"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
