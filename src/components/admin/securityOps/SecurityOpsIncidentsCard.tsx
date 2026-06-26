import { SECURITY_INCIDENT_STATUS_LABELS, SECURITY_OPS_HEALTH_LABELS } from "../../../constants/securityOperationsCenter";
import type { SecurityOpsIncident } from "../../../types/securityOperationsCenter";

type SecurityOpsIncidentsCardProps = {
  incidents: SecurityOpsIncident[];
};

export function SecurityOpsIncidentsCard({ incidents }: SecurityOpsIncidentsCardProps) {
  const sorted = [...incidents].sort(
    (left, right) => new Date(right.openedAt).getTime() - new Date(left.openedAt).getTime()
  );

  return (
    <section className="security-ops-card security-ops-incidents-card concierge-consultant-card--glass cc-reveal">
      <header className="security-ops-card__head">
        <h3>Incidents</h3>
        <p>Open, investigating, contained, and resolved — with timeline.</p>
      </header>
      <ul className="security-ops-card__list">
        {sorted.map((incident) => (
          <li key={incident.id}>
            <div className="security-ops-card__row">
              <strong>{incident.incidentRef}</strong>
              <span className={`security-ops-incident-status security-ops-incident-status--${incident.status}`}>
                {SECURITY_INCIDENT_STATUS_LABELS[incident.status]}
              </span>
            </div>
            <p>{incident.title}</p>
            <div className="security-ops-card__meta">
              <span>{SECURITY_OPS_HEALTH_LABELS[incident.severity]}</span>
              <span>{incident.ownerEmail}</span>
              <span>{new Date(incident.openedAt).toLocaleString()}</span>
            </div>
            <ul className="security-ops-incidents-card__timeline">
              {incident.timeline.map((entry) => (
                <li key={`${incident.id}-${entry.at}`}>
                  <span>{new Date(entry.at).toLocaleString()}</span>
                  <strong>{entry.actor}</strong>
                  <p>{entry.note}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
