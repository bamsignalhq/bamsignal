import {
  BAMSIGNAL_MUSEUM_FORBIDDEN_COPY,
  RELATIONSHIP_TIMELINE_LABEL
} from "../../../constants/bamSignalMuseum";
import type { RelationshipTimelineViewModel } from "../../../utils/bamSignalMuseumLogic";

type RelationshipTimelineCardProps = {
  timeline: RelationshipTimelineViewModel;
};

export function RelationshipTimelineCard({ timeline }: RelationshipTimelineCardProps) {
  const sorted = [...timeline.entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <article className="bsmu-timeline-card institute-glass">
      <header className="bsmu-timeline-card__head">
        <h3>{timeline.title}</h3>
        <span className="bsmu-timeline-card__badge">{RELATIONSHIP_TIMELINE_LABEL}</span>
      </header>
      <p className="bsmu-timeline-card__preserving">{timeline.preservingStoriesLabel}</p>
      <p className="bsmu-timeline-card__preservation">{timeline.preservationTitle}</p>
      <p className="bsmu-timeline-card__summary">{timeline.summary}</p>

      {sorted.length ? (
        <ol className="bsmu-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="bsmu-timeline-card__item">
              <span className="bsmu-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="bsmu-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="bsmu-timeline-card__empty">Relationship timeline reserved — not live yet.</p>
      )}

      <p className="bsmu-timeline-card__forbidden">
        Not {BAMSIGNAL_MUSEUM_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="bsmu-timeline-card__status">{timeline.statusLabel}</p>
    </article>
  );
}
