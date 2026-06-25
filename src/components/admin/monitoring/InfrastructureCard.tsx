import type { InfrastructureMetrics, MonitoringMetricSnapshot } from "../../../types/monitoringCenter";

type InfrastructureCardProps = {
  infrastructure: InfrastructureMetrics;
  metrics: MonitoringMetricSnapshot[];
};

export function InfrastructureCard({ infrastructure, metrics }: InfrastructureCardProps) {
  return (
    <section className="monitoring-card infrastructure-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>Infrastructure</h3>
        <p>Database, storage, memory, CPU, API response time, and metric snapshots.</p>
      </header>
      <div className="infrastructure-card__grid">
        <article>
          <span>DB connections</span>
          <strong>{infrastructure.databaseConnections}</strong>
        </article>
        <article>
          <span>Storage</span>
          <strong>{infrastructure.storageUsageGb} GB</strong>
        </article>
        <article>
          <span>Memory</span>
          <strong>{infrastructure.memoryUsagePercent}%</strong>
        </article>
        <article>
          <span>CPU</span>
          <strong>{infrastructure.cpuUsagePercent}%</strong>
        </article>
        <article>
          <span>API response</span>
          <strong>{infrastructure.apiResponseTimeMs}ms</strong>
        </article>
      </div>
      {metrics.length ? (
        <ul className="infrastructure-card__metrics">
          {metrics.map((metric) => (
            <li key={metric.id}>
              <span>{metric.metricKey}</span>
              <strong>
                {metric.value}
                {metric.unit ? ` ${metric.unit}` : ""}
              </strong>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="infrastructure-card__captured">
        Captured {new Date(infrastructure.capturedAt).toLocaleString()}
      </p>
    </section>
  );
}
