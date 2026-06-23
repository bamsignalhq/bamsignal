import {
  MONITORED_SERVICE_LABELS,
  SERVICE_HEALTH_STATUS_LABELS
} from "../../../constants/systemHealth";
import type { HealthIncidentRecord } from "../../../types/systemHealth";

type IncidentTimelineProps = {
  incidents: HealthIncidentRecord[];
};

export function IncidentTimeline({ incidents }: IncidentTimelineProps) {
  return (
    <section className="system-health-incident-timeline concierge-consultant-card--glass cc-reveal">
      <header className="system-health-incident-timeline__head">
        <h3>Incident timeline</h3>
        <p>Recent degradations, failures, and recovery windows.</p>
      </header>

      {incidents.length ? (
        <ol className="system-health-incident-timeline__list">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className={`system-health-incident-timeline__item system-health-incident-timeline__item--${incident.severity}`}
            >
              <div className="system-health-incident-timeline__marker" aria-hidden="true" />
              <div className="system-health-incident-timeline__body">
                <div className="system-health-incident-timeline__meta">
                  <span className={`system-health-badge system-health-badge--${incident.severity}`}>
                    {SERVICE_HEALTH_STATUS_LABELS[incident.severity]}
                  </span>
                  <time dateTime={incident.timestamp}>
                    {new Date(incident.timestamp).toLocaleString()}
                  </time>
                </div>
                <h4>{incident.title}</h4>
                <p>{incident.summary}</p>
                <p className="system-health-incident-timeline__service">
                  Service: {MONITORED_SERVICE_LABELS[incident.serviceId]}
                </p>
                <p className="system-health-incident-timeline__recovery">
                  {incident.resolvedAt
                    ? `Resolved ${new Date(incident.resolvedAt).toLocaleString()} · recovery ${incident.recoveryTimeMinutes ?? "—"} min`
                    : "Open incident"}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="system-health-incident-timeline__empty">No incidents recorded.</p>
      )}
    </section>
  );
}
