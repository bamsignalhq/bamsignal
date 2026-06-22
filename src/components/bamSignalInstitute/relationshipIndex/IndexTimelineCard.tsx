import { RELATIONSHIP_INDEX_LABEL } from "../../../constants/relationshipIndex";
import type { RelationshipIndexTimelineEntry } from "../../../constants/relationshipIndex";

type IndexTimelineCardProps = {
  title: string;
  entries: RelationshipIndexTimelineEntry[];
};

export function IndexTimelineCard({ title, entries }: IndexTimelineCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="rix-timeline-card institute-glass">
      <header className="rix-timeline-card__head">
        <h3>{RELATIONSHIP_INDEX_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="rix-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="rix-timeline-card__item">
              <span className="rix-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="rix-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rix-timeline-card__empty">
          Index milestones will appear as yearly indicators mature.
        </p>
      )}
    </section>
  );
}
