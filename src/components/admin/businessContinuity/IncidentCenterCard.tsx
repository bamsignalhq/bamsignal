import type { IncidentReportRecord } from "../../../types/businessContinuity";
import {
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS_LABELS
} from "../../../constants/businessContinuity";
import { formatIncidentSummary } from "../../../utils/businessContinuityLogic";

type IncidentCenterCardProps = {
  incidents: IncidentReportRecord[];
};

export function IncidentCenterCard({ incidents }: IncidentCenterCardProps) {
  return (
    <section className="continuity-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Incident center</h3>
        <p>Track severity, timeline, owner, affected systems, status, resolution, and postmortem.</p>
      </header>
      <ul className="continuity-incident-list">
        {incidents.map((incident) => (
          <li key={incident.id} className={`continuity-incident continuity-incident--${incident.severity}`}>
            <div className="continuity-incident__head">
              <strong>{incident.title}</strong>
              <span>{formatIncidentSummary(incident)}</span>
            </div>
            <div className="continuity-incident__meta">
              <span>Owner: {incident.ownerEmail}</span>
              <span>Systems: {incident.affectedSystems.join(", ")}</span>
            </div>
            <ol className="continuity-timeline">
              {incident.timeline.map((entry, index) => (
                <li key={`${incident.id}_${index}`}>
                  <time>{new Date(entry.at).toLocaleString()}</time>
                  <span>{entry.actor}</span>
                  <p>{entry.note}</p>
                </li>
              ))}
            </ol>
            {incident.resolution ? (
              <p className="continuity-incident__resolution">
                <strong>Resolution:</strong> {incident.resolution}
              </p>
            ) : null}
            {incident.postmortem ? (
              <p className="continuity-incident__postmortem">
                <strong>Postmortem:</strong> {incident.postmortem}
              </p>
            ) : null}
            <div className="continuity-incident__badges">
              <span className={`continuity-pill continuity-pill--${incident.severity === "critical" ? "major-outage" : incident.severity === "high" ? "partial-outage" : "degraded"}`}>
                {INCIDENT_SEVERITY_LABELS[incident.severity]}
              </span>
              <span className="continuity-pill">{INCIDENT_STATUS_LABELS[incident.status]}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
