import {
  GROWING_TOGETHER_LABEL,
  LEARNING_LABEL,
  PREMARITAL_JOURNEY_FOUNDATION_COPY,
  PREMARITAL_JOURNEY_LABEL,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/premaritalJourney";
import type { PremaritalModuleViewModel } from "../../../utils/premaritalJourneyLogic";

type PremaritalModuleCardProps = {
  module: PremaritalModuleViewModel;
};

export function PremaritalModuleCard({ module }: PremaritalModuleCardProps) {
  return (
    <article className="pj-module-card institute-glass">
      <header className="pj-module-card__head">
        <h3>{module.title}</h3>
        <span className="pj-module-card__badge">{PREMARITAL_JOURNEY_LABEL}</span>
      </header>

      <p className="pj-module-card__order">Module {module.order}</p>
      <p className="pj-module-card__labels">
        {LEARNING_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="pj-module-card__foundation">{PREMARITAL_JOURNEY_FOUNDATION_COPY}</p>
      <p className="pj-module-card__description">{module.description}</p>
      <p className="pj-module-card__status">{module.statusLabel}</p>
    </article>
  );
}
