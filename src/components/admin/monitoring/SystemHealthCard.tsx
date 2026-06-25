import { MONITORING_SERVICE_STATUS_LABELS } from "../../../constants/monitoringCenter";
import type { MonitoringSummary } from "../../../types/monitoringCenter";
import { formatMonitoringSummaryLine } from "../../../utils/monitoringCenterLogic";

type SystemHealthCardProps = {
  summary: MonitoringSummary;
};

export function SystemHealthCard({ summary }: SystemHealthCardProps) {
  return (
    <section className="monitoring-card system-health-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>System health</h3>
        <p>Institutional NOC posture — overall availability and operational status.</p>
      </header>
      <div className="system-health-card__overall">
        <span>Overall</span>
        <strong className={`monitoring-status monitoring-status--${summary.overallStatus}`}>
          {MONITORING_SERVICE_STATUS_LABELS[summary.overallStatus]}
        </strong>
      </div>
      <p className="system-health-card__line">{formatMonitoringSummaryLine(summary)}</p>
      <div className="system-health-card__grid">
        <article>
          <span>Healthy</span>
          <strong>{summary.healthyCount}</strong>
        </article>
        <article>
          <span>Degraded</span>
          <strong>{summary.degradedCount}</strong>
        </article>
        <article>
          <span>Outage</span>
          <strong>{summary.outageCount}</strong>
        </article>
        <article>
          <span>Open incidents</span>
          <strong>{summary.openIncidents}</strong>
        </article>
        <article>
          <span>Open alerts</span>
          <strong>{summary.openAlerts}</strong>
        </article>
        <article>
          <span>Maintenance</span>
          <strong>{summary.activeMaintenance}</strong>
        </article>
      </div>
    </section>
  );
}
