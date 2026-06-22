import { PREMARITAL_JOURNEY_LABEL } from "../../../constants/premaritalJourney";
import type { JourneyMilestoneEntry } from "../../../constants/premaritalJourney";

type JourneyMilestoneCardProps = {
  title: string;
  milestones: JourneyMilestoneEntry[];
};

export function JourneyMilestoneCard({ title, milestones }: JourneyMilestoneCardProps) {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="pj-milestone-card institute-glass">
      <header className="pj-milestone-card__head">
        <h3>{PREMARITAL_JOURNEY_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="pj-milestone-card__list">
          {sorted.map((milestone) => (
            <li key={milestone.id} className="pj-milestone-card__item">
              <span className="pj-milestone-card__dot" aria-hidden />
              <div>
                <strong>{milestone.label}</strong>
                {milestone.note ? <p className="pj-milestone-card__note">{milestone.note}</p> : null}
                <time dateTime={milestone.recordedAt}>
                  {new Date(milestone.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="pj-milestone-card__empty">
          Journey milestones will appear as premarital modules mature.
        </p>
      )}
    </section>
  );
}
