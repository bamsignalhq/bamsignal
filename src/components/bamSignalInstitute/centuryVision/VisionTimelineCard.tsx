import {
  CENTURY_VISION_FORBIDDEN_COPY,
  VISION_TIMELINE_LABEL
} from "../../../constants/centuryVision";
import type { VisionTimelineViewModel } from "../../../utils/centuryVisionLogic";

type VisionTimelineCardProps = {
  timeline: VisionTimelineViewModel;
};

export function VisionTimelineCard({ timeline }: VisionTimelineCardProps) {
  const sorted = [...timeline.entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <article className="cvis-timeline-card institute-glass">
      <header className="cvis-timeline-card__head">
        <h3>{timeline.title}</h3>
        <span className="cvis-timeline-card__badge">{VISION_TIMELINE_LABEL}</span>
      </header>
      <p className="cvis-timeline-card__document">{timeline.documentTitle}</p>
      <p className="cvis-timeline-card__summary">{timeline.summary}</p>

      {sorted.length ? (
        <ol className="cvis-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="cvis-timeline-card__item">
              <span className="cvis-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="cvis-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="cvis-timeline-card__empty">Vision timeline reserved — not live yet.</p>
      )}

      <p className="cvis-timeline-card__forbidden">
        Not {CENTURY_VISION_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="cvis-timeline-card__status">{timeline.statusLabel}</p>
    </article>
  );
}
