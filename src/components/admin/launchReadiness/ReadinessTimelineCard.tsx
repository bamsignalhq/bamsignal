import { LAUNCH_READINESS_AREA_LABELS, LAUNCH_READINESS_STATUS_LABELS } from "../../../constants/launchReadiness";
import type { ReadinessTimelineEntry } from "../../../types/launchReadiness";

type ReadinessTimelineCardProps = {
  timeline: ReadinessTimelineEntry[];
};

export function ReadinessTimelineCard({ timeline }: ReadinessTimelineCardProps) {
  return (
    <section className="readiness-timeline-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-timeline-card__head">
        <h3>Readiness timeline</h3>
        <p>Assessment sequence across institutional areas — read-only audit trail.</p>
      </header>

      <ol className="readiness-timeline-card__list">
        {timeline.map((entry) => (
          <li key={entry.id} className={`readiness-timeline-card__item readiness-timeline-card__item--${entry.status}`}>
            <div className="readiness-timeline-card__marker" aria-hidden="true" />
            <div>
              <strong>{entry.label}</strong>
              <p>{entry.note}</p>
              <small>
                {LAUNCH_READINESS_AREA_LABELS[entry.areaId]} · {LAUNCH_READINESS_STATUS_LABELS[entry.status]} ·{" "}
                {new Date(entry.at).toLocaleString()}
              </small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
