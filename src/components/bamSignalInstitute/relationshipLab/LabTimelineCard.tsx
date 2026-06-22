import { RESEARCH_LAB_LABEL } from "../../../constants/relationshipLab";
import type { LabTimelineEntry } from "../../../constants/relationshipLab";

type LabTimelineCardProps = {
  title: string;
  entries: LabTimelineEntry[];
};

export function LabTimelineCard({ title, entries }: LabTimelineCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="rl-timeline-card institute-glass">
      <header className="rl-timeline-card__head">
        <h3>{RESEARCH_LAB_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="rl-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="rl-timeline-card__item">
              <span className="rl-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="rl-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rl-timeline-card__empty">
          Lab milestones will appear as research divisions mature.
        </p>
      )}
    </section>
  );
}
