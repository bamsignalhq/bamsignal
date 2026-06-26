import { PLATFORM_HEALTH_STATUS_LABELS } from "../../../constants/platformHealth";
import type { PlatformHealthIncidentRecord } from "../../../types/platformHealth";
import { formatPlatformHealthDuration } from "../../../utils/platformHealthLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type PlatformHealthIncidentsCardProps = {
  activeIncidents: PlatformHealthIncidentRecord[];
  resolvedIncidents: PlatformHealthIncidentRecord[];
  onAcknowledge: (incidentId: string) => void;
};

const BADGE_STATUS = {
  healthy: "healthy" as const,
  warning: "warning" as const,
  critical: "critical" as const
};

function IncidentBlock({
  incident,
  onAcknowledge
}: {
  incident: PlatformHealthIncidentRecord;
  onAcknowledge?: (incidentId: string) => void;
}) {
  return (
    <article className={`platform-health-incident platform-health-incident--${incident.severity}`}>
      <header className="platform-health-incident__head">
        <div>
          <span className="platform-health-incident__ref">{incident.incidentRef}</span>
          <h4>{incident.title}</h4>
        </div>
        <InstitutionalStatusBadge
          status={BADGE_STATUS[incident.severity]}
          label={PLATFORM_HEALTH_STATUS_LABELS[incident.severity]}
        />
      </header>
      <p>{incident.summary}</p>
      <p className="platform-health-incident__meta">
        Opened {formatPlatformHealthDuration(incident.openedAt)}
        {incident.acknowledgedBy ? ` · Acknowledged by ${incident.acknowledgedBy}` : ""}
        {incident.resolvedAt ? ` · Resolved ${formatPlatformHealthDuration(incident.resolvedAt)}` : ""}
      </p>
      {incident.status === "active" && onAcknowledge ? (
        <button
          type="button"
          className="concierge-consultant-btn platform-health-incident__ack"
          onClick={() => onAcknowledge(incident.id)}
        >
          Acknowledge
        </button>
      ) : null}
      <ol className="platform-health-incident__timeline">
        {incident.timeline.map((entry, index) => (
          <li key={`${incident.id}-${index}`}>
            <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
            <strong>{entry.actor}</strong>
            <span>{entry.note}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}

export function PlatformHealthIncidentsCard({
  activeIncidents,
  resolvedIncidents,
  onAcknowledge
}: PlatformHealthIncidentsCardProps) {
  return (
    <section className="platform-health-incidents concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Incidents</h3>
        <p>Current incidents, resolved history, timeline, and acknowledgements.</p>
      </header>

      <div className="platform-health-incidents__columns">
        <div>
          <h4>Current ({activeIncidents.length})</h4>
          {activeIncidents.length === 0 ? (
            <p className="platform-health-incidents__empty">No active incidents.</p>
          ) : (
            activeIncidents.map((incident) => (
              <IncidentBlock key={incident.id} incident={incident} onAcknowledge={onAcknowledge} />
            ))
          )}
        </div>
        <div>
          <h4>Resolved ({resolvedIncidents.length})</h4>
          {resolvedIncidents.map((incident) => (
            <IncidentBlock key={incident.id} incident={incident} />
          ))}
        </div>
      </div>
    </section>
  );
}
