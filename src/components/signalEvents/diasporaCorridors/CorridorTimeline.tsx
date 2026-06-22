import { JOURNEY_ACROSS_BORDERS_LABEL } from "../../../constants/diasporaCorridors";
import type { DiasporaCorridorTimelineEntry } from "../../../constants/diasporaCorridors";

type CorridorTimelineProps = {
  routeLabel: string;
  entries: DiasporaCorridorTimelineEntry[];
};

export function CorridorTimeline({ routeLabel, entries }: CorridorTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="dc-corridor-timeline signal-events-glass">
      <header className="dc-corridor-timeline__head">
        <h3>{JOURNEY_ACROSS_BORDERS_LABEL}</h3>
        <p>{routeLabel}</p>
      </header>

      {sorted.length ? (
        <ol className="dc-corridor-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="dc-corridor-timeline__item">
              <span className="dc-corridor-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="dc-corridor-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="dc-corridor-timeline__empty">
          Corridor milestones will appear as pathways mature with care.
        </p>
      )}
    </section>
  );
}
