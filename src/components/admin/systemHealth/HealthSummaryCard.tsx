import {
  SERVICE_HEALTH_STATUS_LABELS,
  type ServiceHealthStatusId
} from "../../../constants/systemHealth";
import type { HealthSummary } from "../../../types/systemHealth";

type HealthSummaryCardProps = {
  summary: HealthSummary;
  liveProbe: boolean;
};

export function HealthSummaryCard({ summary, liveProbe }: HealthSummaryCardProps) {
  return (
    <section className="system-health-summary concierge-consultant-card--glass cc-reveal">
      <header className="system-health-summary__head">
        <h3>Health summary</h3>
        <p>
          Overall institutional status:{" "}
          <span className={`system-health-badge system-health-badge--${summary.overallStatus}`}>
            {SERVICE_HEALTH_STATUS_LABELS[summary.overallStatus]}
          </span>
        </p>
      </header>

      <div className="system-health-summary__metrics">
        <Metric label="Healthy" value={String(summary.healthyCount)} status="healthy" />
        <Metric label="Degraded" value={String(summary.degradedCount)} status="degraded" />
        <Metric label="Offline" value={String(summary.offlineCount)} status="offline" />
        <Metric label="Maintenance" value={String(summary.maintenanceCount)} status="maintenance" />
        <Metric label="Critical offline" value={String(summary.criticalOfflineCount)} status="offline" />
      </div>

      <footer className="system-health-summary__foot">
        <p>Last checked: {new Date(summary.lastCheckedAt).toLocaleString()}</p>
        <p>Live probe: {liveProbe ? "connected" : "seed fallback"}</p>
      </footer>
    </section>
  );
}

function Metric({
  label,
  value,
  status
}: {
  label: string;
  value: string;
  status: ServiceHealthStatusId;
}) {
  return (
    <article className={`system-health-metric-chip system-health-metric-chip--${status}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
