import { LEARNING_PATHS_LABEL } from "../../../constants/learningPaths";
import type { PathMilestoneEntry } from "../../../constants/learningPaths";

type PathMilestoneCardProps = {
  title: string;
  milestones: PathMilestoneEntry[];
};

export function PathMilestoneCard({ title, milestones }: PathMilestoneCardProps) {
  const sorted = [...milestones].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return (
    <section className="lp-milestone-card institute-glass">
      <header className="lp-milestone-card__head">
        <h3>{LEARNING_PATHS_LABEL}</h3>
        <p>{title}</p>
      </header>

      {sorted.length ? (
        <ol className="lp-milestone-card__list">
          {sorted.map((milestone) => (
            <li key={milestone.id} className="lp-milestone-card__item">
              <span className="lp-milestone-card__dot" aria-hidden />
              <div>
                <strong>{milestone.label}</strong>
                {milestone.note ? <p className="lp-milestone-card__note">{milestone.note}</p> : null}
                <time dateTime={milestone.recordedAt}>
                  {new Date(milestone.recordedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="lp-milestone-card__empty">
          Path milestones will appear as guided journeys mature.
        </p>
      )}
    </section>
  );
}
