import {
  INSIGHTS_LABEL,
  RESEARCH_LAB_LABEL,
  UNDERSTANDING_RELATIONSHIPS_LABEL
} from "../../../constants/relationshipLab";
import type { ResearchLabViewModel } from "../../../utils/relationshipLabLogic";

type ResearchLabCardProps = {
  lab: ResearchLabViewModel;
};

export function ResearchLabCard({ lab }: ResearchLabCardProps) {
  return (
    <article className="rl-lab-card institute-glass">
      <header className="rl-lab-card__head">
        <h3>{lab.title}</h3>
        <span className="rl-lab-card__badge">{RESEARCH_LAB_LABEL}</span>
      </header>

      <p className="rl-lab-card__labels">
        {INSIGHTS_LABEL} · {UNDERSTANDING_RELATIONSHIPS_LABEL}
      </p>
      <p className="rl-lab-card__category">{lab.categoryLabel}</p>
      <p className="rl-lab-card__description">{lab.description}</p>
      <p className="rl-lab-card__status">{lab.statusLabel}</p>
    </article>
  );
}
