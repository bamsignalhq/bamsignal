import { CENTURY_TRUST_LABEL } from "../../../constants/centuryTrust";
import type { TrustTimelineEntryViewModel } from "../../../types/centuryTrust";

type TrustTimelineCardProps = {
  entries: TrustTimelineEntryViewModel[];
};

export function TrustTimelineCard({ entries }: TrustTimelineCardProps) {
  const sorted = [...entries].sort(
    (left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime()
  );

  return (
    <section className="ctrust-timeline-card institute-glass">
      <header className="ctrust-timeline-card__head">
        <h3>{CENTURY_TRUST_LABEL}</h3>
        <p>Trust timeline — generational milestones, not legal filings.</p>
      </header>
      {sorted.length ? (
        <ol className="ctrust-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="ctrust-timeline-card__item">
              <span className="ctrust-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="ctrust-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="ctrust-card__empty">Trust milestones will appear as generational stewardship matures.</p>
      )}
    </section>
  );
}
