import { JOURNEY_ACROSS_BORDERS_LABEL } from "../../../constants/corridorStories";
import type { CorridorStoryTimelineEntry } from "../../../constants/corridorStories";

type CorridorStoryTimelineProps = {
  title: string;
  entries: CorridorStoryTimelineEntry[];
};

export function CorridorStoryTimeline({ title, entries }: CorridorStoryTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="cs-story-timeline signal-events-glass">
      <header className="cs-story-timeline__head">
        <h3>{JOURNEY_ACROSS_BORDERS_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="cs-story-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="cs-story-timeline__item">
              <span className="cs-story-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="cs-story-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="cs-story-timeline__empty">
          Story milestones will appear as journeys are preserved with consent.
        </p>
      )}
    </section>
  );
}
