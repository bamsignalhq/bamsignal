import { INCIDENT_SEVERITY_LABELS, INCIDENT_STATUS_LABELS } from "../../../constants/monitoringCenter";
import type { MonitoringIncidentRecord } from "../../../types/monitoringCenter";

type IncidentTimelineCardProps = {
  incidents: MonitoringIncidentRecord[];
};

export function IncidentTimelineCard({ incidents }: IncidentTimelineCardProps) {
  const sorted = [...incidents].sort(
    (left, right) => new Date(right.openedAt).getTime() - new Date(left.openedAt).getTime()
  );

  return (
    <section className="monitoring-card incident-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="monitoring-card__head">
        <h3>Incidents</h3>
        <p>Severity, affected services, timeline, mitigation, resolution, postmortem, owner.</p>
      </header>
      {sorted.length ? (
        <ul className="incident-timeline-card__list">
          {sorted.map((incident) => (
            <li key={incident.id}>
              <div className="incident-timeline-card__row">
                <strong>{incident.incidentRef}</strong>
                <span className={`incident-severity incident-severity--${incident.severity}`}>
                  {INCIDENT_SEVERITY_LABELS[incident.severity]}
                </span>
              </div>
              <h4>{incident.title}</h4>
              <p className="incident-timeline-card__meta">
                {INCIDENT_STATUS_LABELS[incident.status]} · Owner: {incident.ownerEmail}
              </p>
              <p className="incident-timeline-card__services">
                {incident.affectedServices.join(", ")}
              </p>
              {incident.rootCause ? <p>Root cause: {incident.rootCause}</p> : null}
              {incident.mitigation ? <p>Mitigation: {incident.mitigation}</p> : null}
              <ol className="incident-timeline-card__timeline">
                {incident.timeline.map((entry) => (
                  <li key={`${entry.at}-${entry.note}`}>
                    <span>{new Date(entry.at).toLocaleString()}</span>
                    <strong>{entry.actor}</strong>
                    <p>{entry.note}</p>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      ) : (
        <p className="monitoring-card__empty">No incidents on record.</p>
      )}
    </section>
  );
}
