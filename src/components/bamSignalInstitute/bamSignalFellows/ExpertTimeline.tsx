import { BAMSIGNAL_FELLOWS_LABEL } from "../../../constants/bamSignalFellows";
import type { ExpertTimelineEntry } from "../../../constants/bamSignalFellows";

type ExpertTimelineProps = {
  title: string;
  entries: ExpertTimelineEntry[];
};

export function ExpertTimeline({ title, entries }: ExpertTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="bsf-expert-timeline institute-glass">
      <header className="bsf-expert-timeline__head">
        <h3>{BAMSIGNAL_FELLOWS_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="bsf-expert-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="bsf-expert-timeline__item">
              <span className="bsf-expert-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="bsf-expert-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="bsf-expert-timeline__empty">
          Expert timelines will appear as fellows join the network.
        </p>
      )}
    </section>
  );
}
