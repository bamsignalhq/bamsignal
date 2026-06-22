import { BAMSIGNAL_ACADEMY_LABEL } from "../../../constants/bamSignalAcademy";
import type { AcademyTimelineEntry } from "../../../constants/bamSignalAcademy";

type AcademyTimelineProps = {
  entries: AcademyTimelineEntry[];
};

export function AcademyTimeline({ entries }: AcademyTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="bsa-timeline institute-glass">
      <header className="bsa-timeline__head">
        <h3>{BAMSIGNAL_ACADEMY_LABEL}</h3>
        <p>Education arm milestones — prepared, not enabled.</p>
      </header>

      {sorted.length ? (
        <ol className="bsa-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="bsa-timeline__item">
              <span className="bsa-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="bsa-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="bsa-timeline__empty">
          Academy milestones will appear as the education arm matures.
        </p>
      )}
    </section>
  );
}
