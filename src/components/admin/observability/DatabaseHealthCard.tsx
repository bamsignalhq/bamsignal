import { OBSERVABILITY_SERVICE_STATUS_LABELS } from "../../../constants/productionObservability";
import type {
  ObservabilityDatabaseHealth,
  ObservabilityPerformanceSnapshot
} from "../../../types/productionObservability";
import { formatObservabilityCheckedAt } from "../../../utils/productionObservabilityLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

const STATUS_BADGE = {
  healthy: "healthy",
  warning: "warning",
  offline: "broken"
} as const;

type DatabaseHealthCardProps = {
  database: ObservabilityDatabaseHealth;
};

export function DatabaseHealthCard({ database }: DatabaseHealthCardProps) {
  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Database Health</h3>
        <p>Postgres connections, active queries, and slow query count.</p>
      </header>
      <div className="observability-card__metrics">
        <InstitutionalStatusBadge
          status={STATUS_BADGE[database.status]}
          label={OBSERVABILITY_SERVICE_STATUS_LABELS[database.status]}
        />
        <span>
          {database.connectionCount}/{database.maxConnections} connections
        </span>
        <span>{database.activeQueries} active queries</span>
        <span>{database.slowQueries24h} slow queries (24h)</span>
        <span className="observability-card__muted">
          {database.replicationLagMs !== null
            ? `Replication lag ${database.replicationLagMs} ms`
            : "Single-node Postgres"}
        </span>
        <span className="observability-card__muted">
          Checked {formatObservabilityCheckedAt(database.checkedAt)}
        </span>
      </div>
    </section>
  );
}

type PerformanceMetricsCardProps = {
  performance: ObservabilityPerformanceSnapshot;
};

export function PerformanceMetricsCard({ performance }: PerformanceMetricsCardProps) {
  return (
    <section className="observability-card concierge-consultant-card--glass cc-reveal">
      <header className="observability-card__head">
        <h3>Performance</h3>
        <p>Runtime resource usage, build version, and environment.</p>
      </header>
      <div className="observability-card__metrics">
        <span>Memory {performance.memoryUsagePercent}%</span>
        <span>CPU {performance.cpuUsagePercent}%</span>
        <span>{performance.databaseConnections} DB connections</span>
        <span>Network {performance.networkMbps} Mbps</span>
        <span>Build v{performance.buildVersion}</span>
        <span>{performance.environment}</span>
        <span className="observability-card__muted">
          Captured {formatObservabilityCheckedAt(performance.capturedAt)}
        </span>
      </div>
    </section>
  );
}
