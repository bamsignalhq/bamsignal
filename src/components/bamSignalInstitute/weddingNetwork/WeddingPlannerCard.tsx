import {
  GROWING_TOGETHER_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  WEDDING_PLANNER_LABEL
} from "../../../constants/weddingNetwork";
import type { WeddingPlannerViewModel } from "../../../utils/weddingNetworkLogic";

type WeddingPlannerCardProps = {
  planner: WeddingPlannerViewModel;
};

export function WeddingPlannerCard({ planner }: WeddingPlannerCardProps) {
  return (
    <article className="wdn-planner-card institute-glass">
      <header className="wdn-planner-card__head">
        <h3>{planner.name}</h3>
        <span className="wdn-planner-card__badge">{WEDDING_PLANNER_LABEL}</span>
      </header>

      <p className="wdn-planner-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="wdn-planner-card__category">{planner.categoryTitle}</p>
      <p className="wdn-planner-card__title">{planner.title}</p>
      <p className="wdn-planner-card__focus">{planner.focus}</p>
      <p className="wdn-planner-card__status">{planner.statusLabel}</p>
    </article>
  );
}
