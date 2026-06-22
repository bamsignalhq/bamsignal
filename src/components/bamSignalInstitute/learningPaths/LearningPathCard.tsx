import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  LEARNING_PATHS_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/learningPaths";
import type { LearningPathJourneyViewModel } from "../../../utils/learningPathsLogic";

type LearningPathCardProps = {
  path: LearningPathJourneyViewModel;
};

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <article className="lp-path-card institute-glass">
      <header className="lp-path-card__head">
        <h3>{path.title}</h3>
        <span className="lp-path-card__badge">{LEARNING_PATHS_LABEL}</span>
      </header>

      <p className="lp-path-card__labels">
        {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="lp-path-card__description">{path.description}</p>
      <p className="lp-path-card__status">{path.statusLabel}</p>
    </article>
  );
}
