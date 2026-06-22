import { JOURNEY_MILESTONES_TITLE } from "../../constants/journeyMilestones";
import { getJourneyMilestoneDefinition } from "../../constants/journeyMilestones";
import type { JourneyMilestoneEntry } from "../../types/journeyMilestone";

type LegacyMilestoneCardProps = {
  milestones: JourneyMilestoneEntry[];
  celebrate?: boolean;
};

export function LegacyMilestoneCard({ milestones, celebrate = false }: LegacyMilestoneCardProps) {
  return (
    <section
      className={`legacy-milestone-card${celebrate ? " legacy-milestone-card--celebrate" : ""}`}
    >
      <header className="legacy-milestone-card__head">
        <h4>{JOURNEY_MILESTONES_TITLE}</h4>
      </header>
      {milestones.length ? (
        <ul className="legacy-milestone-card__list">
          {milestones.map((entry) => {
            const definition = getJourneyMilestoneDefinition(entry.id);
            return (
              <li key={entry.id} className="legacy-milestone-card__item">
                <span className="legacy-milestone-card__emoji" aria-hidden>
                  {definition?.emoji ?? "✨"}
                </span>
                <span className="legacy-milestone-card__label">
                  {definition?.label ?? entry.id}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="legacy-milestone-card__empty">
          Anniversary milestones will be celebrated here as your journey continues.
        </p>
      )}
    </section>
  );
}
