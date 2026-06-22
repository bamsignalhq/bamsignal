import { STEWARDSHIP_COUNCIL_LABEL } from "../../../constants/stewardshipCouncil";
import type { CouncilTimelineEntryViewModel } from "../../../types/stewardshipCouncil";

type CouncilTimelineCardProps = {
  entries: CouncilTimelineEntryViewModel[];
};

export function CouncilTimelineCard({ entries }: CouncilTimelineCardProps) {
  const sorted = [...entries].sort(
    (left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime()
  );

  return (
    <section className="stc-timeline-card institute-glass">
      <header className="stc-timeline-card__head">
        <h3>{STEWARDSHIP_COUNCIL_LABEL}</h3>
        <p>Stewardship timeline — architecture milestones, not council sessions.</p>
      </header>
      {sorted.length ? (
        <ol className="stc-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="stc-timeline-card__item">
              <span className="stc-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="stc-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="stc-card__empty">Council milestones will appear as stewardship matures.</p>
      )}
    </section>
  );
}
