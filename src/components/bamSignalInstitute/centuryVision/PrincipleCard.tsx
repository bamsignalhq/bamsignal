import {
  CENTURY_VISION_FORBIDDEN_COPY,
  INSTITUTION_LABEL,
  PRINCIPLE_LABEL
} from "../../../constants/centuryVision";
import type { PrincipleViewModel } from "../../../utils/centuryVisionLogic";

type PrincipleCardProps = {
  principle: PrincipleViewModel;
};

export function PrincipleCard({ principle }: PrincipleCardProps) {
  return (
    <article className="cvis-principle-card institute-glass">
      <header className="cvis-principle-card__head">
        <h3>{principle.title}</h3>
        <span className="cvis-principle-card__badge">{PRINCIPLE_LABEL}</span>
      </header>
      <p className="cvis-principle-card__institution">{INSTITUTION_LABEL}</p>
      <p className="cvis-principle-card__description">{principle.description}</p>
      <p className="cvis-principle-card__forbidden">
        Not {CENTURY_VISION_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="cvis-principle-card__status">{principle.statusLabel}</p>
    </article>
  );
}
