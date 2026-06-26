import {
  PLATFORM_HEALTH_STATUS_LABELS,
  PLATFORM_HEALTH_TRAFFIC_LIGHT,
  type PlatformHealthStatusId
} from "../../../constants/platformHealth";
import type { PlatformHealthSummary } from "../../../types/platformHealth";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type PlatformHealthSummaryCardProps = {
  summary: PlatformHealthSummary;
  liveProbe: boolean;
};

const BADGE_STATUS: Record<PlatformHealthStatusId, "healthy" | "warning" | "critical"> = {
  healthy: "healthy",
  warning: "warning",
  critical: "critical"
};

export function PlatformHealthSummaryCard({ summary, liveProbe }: PlatformHealthSummaryCardProps) {
  const light = PLATFORM_HEALTH_TRAFFIC_LIGHT[summary.overallStatus];

  return (
    <section className="platform-health-summary concierge-consultant-card--glass cc-reveal">
      <div className="platform-health-summary__hero">
        <div
          className={`platform-health-traffic-light platform-health-traffic-light--${light}`}
          aria-label={`Overall status: ${PLATFORM_HEALTH_STATUS_LABELS[summary.overallStatus]}`}
        >
          <span className="platform-health-traffic-light__bulb platform-health-traffic-light__bulb--red" />
          <span className="platform-health-traffic-light__bulb platform-health-traffic-light__bulb--yellow" />
          <span className="platform-health-traffic-light__bulb platform-health-traffic-light__bulb--green" />
        </div>
        <div>
          <h3>Morning checklist</h3>
          <p>
            {PLATFORM_HEALTH_STATUS_LABELS[summary.overallStatus]} — {summary.criticalOfflineCount} critical
            dependencies offline
          </p>
          <InstitutionalStatusBadge
            status={BADGE_STATUS[summary.overallStatus]}
            label={PLATFORM_HEALTH_STATUS_LABELS[summary.overallStatus]}
          />
        </div>
      </div>

      <div className="platform-health-summary__counts">
        <div className="platform-health-summary__count platform-health-summary__count--green">
          <strong>{summary.healthyCount}</strong>
          <span>Healthy</span>
        </div>
        <div className="platform-health-summary__count platform-health-summary__count--yellow">
          <strong>{summary.warningCount}</strong>
          <span>Warning</span>
        </div>
        <div className="platform-health-summary__count platform-health-summary__count--red">
          <strong>{summary.criticalCount}</strong>
          <span>Critical</span>
        </div>
      </div>

      <footer className="platform-health-summary__foot">
        <p>Last checked: {new Date(summary.lastCheckedAt).toLocaleString()}</p>
        <p>Live probe: {liveProbe ? "connected" : "seed fallback"}</p>
      </footer>
    </section>
  );
}
