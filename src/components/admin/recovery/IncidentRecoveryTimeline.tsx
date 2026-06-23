import {
  INCIDENT_RECOVERY_STATUS_LABELS,
  RECOVERY_LEVEL_LABELS
} from "../../../constants/recoveryCenter";
import type { RecoveryTimelineEntry } from "../../../types/recoveryCenter";

type IncidentRecoveryTimelineProps = {
  timeline: RecoveryTimelineEntry[];
};

export function IncidentRecoveryTimeline({ timeline }: IncidentRecoveryTimelineProps) {
  return (
    <section
      className="incident-recovery-timeline concierge-consultant-card--glass cc-reveal"
      aria-label="Incident recovery timeline"
    >
      <header className="incident-recovery-timeline__head">
        <h3>Incident recovery timeline</h3>
        <p>Detect → triage → restore → verify — full recovery audit trail.</p>
      </header>

      {timeline.length ? (
        <ol className="incident-recovery-timeline__list">
          {[...timeline].reverse().map((entry) => (
            <li key={entry.id}>
              <div className="incident-recovery-timeline__row">
                <strong>{entry.phase}</strong>
                <span>{entry.actor}</span>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="incident-recovery-timeline__empty">No recovery timeline entries recorded.</p>
      )}
    </section>
  );
}

export { INCIDENT_RECOVERY_STATUS_LABELS, RECOVERY_LEVEL_LABELS };
