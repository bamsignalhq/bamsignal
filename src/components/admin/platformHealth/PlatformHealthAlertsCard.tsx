import {
  PLATFORM_HEALTH_ALERT_CHANNELS,
  PLATFORM_HEALTH_FUTURE_CAPABILITIES,
  PLATFORM_HEALTH_SERVICE_LABELS
} from "../../../constants/platformHealth";
import type { PlatformHealthAlertRule } from "../../../types/platformHealth";

type PlatformHealthAlertsCardProps = {
  alerts: PlatformHealthAlertRule[];
};

export function PlatformHealthAlertsCard({ alerts }: PlatformHealthAlertsCardProps) {
  return (
    <section className="platform-health-alerts concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Alerts & escalation</h3>
        <p>Thresholds, escalation levels, and notification channels.</p>
      </header>

      <div className="platform-health-alerts__channels">
        {PLATFORM_HEALTH_ALERT_CHANNELS.map((channel) => (
          <span
            key={channel.id}
            className={`platform-health-alerts__channel${"future" in channel && channel.future ? " platform-health-alerts__channel--future" : ""}`}
          >
            {channel.label}
          </span>
        ))}
      </div>

      <table className="platform-health-alerts__table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Threshold</th>
            <th>Failures</th>
            <th>Escalation</th>
            <th>Channels</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr key={`${alert.serviceId}-${alert.id}`}>
              <td>{PLATFORM_HEALTH_SERVICE_LABELS[alert.serviceId]}</td>
              <td>{alert.thresholdMs > 0 ? `${alert.thresholdMs}ms` : "Queue depth"}</td>
              <td>{alert.failureThreshold}</td>
              <td>L{alert.escalationLevel}</td>
              <td>{alert.channels.join(", ")}</td>
              <td>{alert.enabled ? "Enabled" : "Disabled"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="platform-health-alerts__future">
        <h4>Future channels</h4>
        <ul>
          {PLATFORM_HEALTH_FUTURE_CAPABILITIES.map((item) => (
            <li key={item.id}>
              <strong>{item.label}</strong> — {item.description}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
