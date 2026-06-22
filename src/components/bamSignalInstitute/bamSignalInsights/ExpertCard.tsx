import {
  INSIGHTS_LABEL,
  PERSPECTIVES_LABEL
} from "../../../constants/bamSignalInsights";
import type { ExpertViewModel } from "../../../utils/bamSignalInsightsLogic";

type ExpertCardProps = {
  expert: ExpertViewModel;
};

export function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <article className="bsi-expert-card institute-glass">
      <header className="bsi-expert-card__head">
        <h3>{expert.name}</h3>
        <span className="bsi-expert-card__badge">{PERSPECTIVES_LABEL}</span>
      </header>

      <p className="bsi-expert-card__labels">{INSIGHTS_LABEL}</p>
      <p className="bsi-expert-card__title">{expert.title}</p>
      <p className="bsi-expert-card__focus">{expert.focus}</p>
      <p className="bsi-expert-card__status">{expert.statusLabel}</p>
    </article>
  );
}
