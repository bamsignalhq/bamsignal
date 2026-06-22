import { VERIFIED_PROFESSIONALS_LABEL } from "../../../constants/verifiedProfessionals";
import type { ExpertTimelineEntry } from "../../../constants/verifiedProfessionals";

type ExpertTimelineCardProps = {
  title: string;
  entries: ExpertTimelineEntry[];
};

export function ExpertTimelineCard({ title, entries }: ExpertTimelineCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="vp-expert-timeline institute-glass">
      <header className="vp-expert-timeline__head">
        <h3>{VERIFIED_PROFESSIONALS_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="vp-expert-timeline__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="vp-expert-timeline__item">
              <span className="vp-expert-timeline__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="vp-expert-timeline__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="vp-expert-timeline__empty">
          Expert timelines will appear as verified professionals join the network.
        </p>
      )}
    </section>
  );
}
