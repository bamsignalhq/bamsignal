import { RESEARCH_LEADERSHIP_LABEL } from "../../../constants/legacyChair";
import type { ResearchLeadershipViewModel } from "../../../utils/legacyChairLogic";

type ResearchLeadershipCardProps = {
  leadership: ResearchLeadershipViewModel;
};

export function ResearchLeadershipCard({ leadership }: ResearchLeadershipCardProps) {
  return (
    <article className="lgch-leadership-card institute-glass">
      <header className="lgch-leadership-card__head">
        <h3>{leadership.title}</h3>
        <span className="lgch-leadership-card__badge">{RESEARCH_LEADERSHIP_LABEL}</span>
      </header>
      <p className="lgch-leadership-card__category">{leadership.categoryTitle}</p>
      <p className="lgch-leadership-card__description">{leadership.description}</p>
      <p className="lgch-leadership-card__status">{leadership.statusLabel}</p>
    </article>
  );
}
