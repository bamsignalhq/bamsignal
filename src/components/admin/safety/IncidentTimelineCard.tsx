import { SAFETY_STATUS_LABELS, SAFETY_WORKFLOW_LABELS } from "../../../constants/safetyCenter";
import type { SafetyTimelineEntry } from "../../../types/safetyCenter";

type IncidentTimelineCardProps = {
  timeline: SafetyTimelineEntry[];
};

export function IncidentTimelineCard({ timeline }: IncidentTimelineCardProps) {
  return (
    <section className="incident-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="incident-timeline-card__head">
        <h3>Incident timeline</h3>
        <p>Full audit trail — append-only workflow history.</p>
      </header>

      {timeline.length ? (
        <ol className="incident-timeline-card__list">
          {[...timeline].reverse().map((entry) => (
            <li key={entry.id}>
              <div className="incident-timeline-card__row">
                <strong>{SAFETY_WORKFLOW_LABELS[entry.workflow]}</strong>
                <span>{entry.actor}</span>
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              {entry.fromStatus || entry.toStatus ? (
                <p className="incident-timeline-card__status">
                  {entry.fromStatus ? SAFETY_STATUS_LABELS[entry.fromStatus] : "—"}
                  {" → "}
                  {entry.toStatus ? SAFETY_STATUS_LABELS[entry.toStatus] : "—"}
                </p>
              ) : null}
              <p>{entry.note}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="incident-timeline-card__empty">No timeline entries recorded.</p>
      )}
    </section>
  );
}
