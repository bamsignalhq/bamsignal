import { GOVERNANCE_FRAMEWORK_LABEL } from "../../../constants/governanceFramework";
import type { GovernanceTimelineEntryViewModel } from "../../../types/governanceFramework";

type GovernanceTimelineCardProps = {
  entries: GovernanceTimelineEntryViewModel[];
};

export function GovernanceTimelineCard({ entries }: GovernanceTimelineCardProps) {
  const sorted = [...entries].sort(
    (left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime()
  );

  return (
    <section className="govf-timeline-card institute-glass">
      <header className="govf-timeline-card__head">
        <h3>{GOVERNANCE_FRAMEWORK_LABEL}</h3>
        <p>Stewardship timeline — architecture milestones, not council votes.</p>
      </header>
      {sorted.length ? (
        <ol className="govf-timeline-card__list">
          {sorted.map((entry) => (
            <li key={entry.id} className="govf-timeline-card__item">
              <span className="govf-timeline-card__dot" aria-hidden />
              <div>
                <strong>{entry.label}</strong>
                {entry.note ? <p className="govf-timeline-card__note">{entry.note}</p> : null}
                <time dateTime={entry.recordedAt}>
                  {new Date(entry.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="govf-card__empty">Governance milestones will appear as stewardship matures.</p>
      )}
    </section>
  );
}
