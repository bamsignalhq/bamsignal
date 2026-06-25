import { INCIDENT_SEVERITY_LABELS } from "../../../constants/monitoringCenter";
import type { MonitoringAlertRecord } from "../../../types/monitoringCenter";

type AlertFeedCardProps = {
  alerts: MonitoringAlertRecord[];
};

export function AlertFeedCard({ alerts }: AlertFeedCardProps) {
  const sorted = [...alerts].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );

  return (
    <section className="monitoring-card alert-feed-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>Alerts</h3>
        <p>Critical, high, medium, low — escalation rules, acknowledgement, resolution tracking.</p>
      </header>
      {sorted.length ? (
        <ul className="alert-feed-card__list">
          {sorted.map((alert) => (
            <li key={alert.id}>
              <div className="alert-feed-card__row">
                <strong>{alert.alertRef}</strong>
                <span className={`alert-severity alert-severity--${alert.severity}`}>
                  {INCIDENT_SEVERITY_LABELS[alert.severity]}
                </span>
              </div>
              <p>{alert.message}</p>
              <div className="alert-feed-card__meta">
                <span>{alert.serviceId}</span>
                <span className={`alert-status alert-status--${alert.status}`}>{alert.status}</span>
                {alert.escalationLevel > 0 ? <span>Escalation L{alert.escalationLevel}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="monitoring-card__empty">No alerts on record.</p>
      )}
    </section>
  );
}
