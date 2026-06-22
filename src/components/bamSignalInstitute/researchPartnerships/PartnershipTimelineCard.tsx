import { RESEARCH_PARTNERSHIPS_LABEL } from "../../../constants/researchPartnerships";
import type { PartnershipTimelineEntry } from "../../../constants/researchPartnerships";

type PartnershipTimelineCardProps = {
  title: string;
  entries: PartnershipTimelineEntry[];
};

export function PartnershipTimelineCard({ title, entries }: PartnershipTimelineCardProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="rp-timeline-card institute-glass">
      <header className="rp-timeline-card__head">
        <h3>{RESEARCH_PARTNERSHIPS_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="rp-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="rp-timeline-card__item">
              <span className="rp-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="rp-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rp-timeline-card__empty">
          Partnership milestones will appear as institutional relationships mature.
        </p>
      )}
    </section>
  );
}
