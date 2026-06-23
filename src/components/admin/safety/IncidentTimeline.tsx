import {
  SAFETY_ACTION_LABELS,
  SAFETY_STATUS_LABELS,
  SAFETY_WORKFLOW_LABELS
} from "../../../constants/safetyCenter";
import type { SafetyTimelineEntry } from "../../../types/safetyCenter";

type IncidentTimelineProps = {
  timeline: SafetyTimelineEntry[];
};

export function IncidentTimeline({ timeline }: IncidentTimelineProps) {
  return (
    <section className="incident-timeline concierge-consultant-card--glass cc-reveal" aria-label="Incident timeline">
      <header className="incident-timeline__head">
        <h3>Incident timeline</h3>
        <p>Full audit trail — append-only workflow history.</p>
      </header>

      {timeline.length ? (
        <ol className="incident-timeline__list">
          {[...timeline].reverse().map((entry) => (
            <li key={entry.id}>
              <div className="incident-timeline__row">
                <strong>{SAFETY_WORKFLOW_LABELS[entry.workflow]}</strong>
                <span>{entry.actor}</span>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              {entry.fromStatus || entry.toStatus ? (
                <p className="incident-timeline__status">
                  {entry.fromStatus ? SAFETY_STATUS_LABELS[entry.fromStatus] : "—"}
                  {" → "}
                  {entry.toStatus ? SAFETY_STATUS_LABELS[entry.toStatus] : "—"}
                </p>
              ) : null}
              {entry.actionId ? (
                <p className="incident-timeline__action">Action: {SAFETY_ACTION_LABELS[entry.actionId]}</p>
              ) : null}
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="incident-timeline__empty">No timeline entries recorded.</p>
      )}
    </section>
  );
}
