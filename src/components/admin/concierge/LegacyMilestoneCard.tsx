import { getJourneyMilestoneDefinition } from "../../../constants/journeyMilestones";
import { CELEBRATING_YOUR_STORY_LABEL, JOURNEY_LABEL } from "../../../constants/relationshipLegacyExperience";
import type { JourneyMilestoneEntry } from "../../../types/journeyMilestone";
import { formatLegacyMilestoneYear } from "../../../utils/relationshipLegacyExperienceLogic";

type LegacyMilestoneCardProps = {
  milestones: JourneyMilestoneEntry[];
};

export function LegacyMilestoneCard({ milestones }: LegacyMilestoneCardProps) {
  return (
    <section className="legacy-experience-milestone-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Anniversaries</h3>
        <p>
          {JOURNEY_LABEL} · {CELEBRATING_YOUR_STORY_LABEL}
        </p>
      </header>

      {milestones.length ? (
        <ul className="legacy-experience-milestone-card__list">
          {milestones.map((entry) => {
            const definition = getJourneyMilestoneDefinition(entry.id);
            const year = formatLegacyMilestoneYear(entry.milestoneAt);
            return (
              <li key={entry.id}>
                <span className="legacy-experience-milestone-card__emoji" aria-hidden>
                  {definition?.emoji ?? "✨"}
                </span>
                <div>
                  <strong>{definition?.label ?? entry.id}</strong>
                  {year ? <span>{year}</span> : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="concierge-consultant__empty">
          Anniversary milestones will be celebrated as your legacy journey continues.
        </p>
      )}
    </section>
  );
}
