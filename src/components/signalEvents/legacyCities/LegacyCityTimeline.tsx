import { COMMUNITY_JOURNEY_LABEL } from "../../../constants/legacyCities";
import type { LegacyCityTimelineEntry } from "../../../constants/legacyCities";

type LegacyCityTimelineProps = {
  title: string;
  entries: LegacyCityTimelineEntry[];
};

export function LegacyCityTimeline({ title, entries }: LegacyCityTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="lc-city-timeline signal-events-glass">
      <header className="lc-city-timeline__head">
        <h3>{COMMUNITY_JOURNEY_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="lc-city-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="lc-city-timeline__item">
              <span className="lc-city-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="lc-city-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="lc-city-timeline__empty">
          Community milestones will appear as legacy identity matures.
        </p>
      )}
    </section>
  );
}
