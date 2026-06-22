import {
  GROWING_TOGETHER_LABEL,
  VERIFIED_PROFESSIONALS_LABEL
} from "../../../constants/verifiedProfessionals";
import type { ProfessionalBadgeViewModel } from "../../../utils/verifiedProfessionalsLogic";

type ProfessionalBadgeProps = {
  badge: ProfessionalBadgeViewModel;
};

export function ProfessionalBadge({ badge }: ProfessionalBadgeProps) {
  return (
    <article className="vp-professional-badge institute-glass">
      <header className="vp-professional-badge__head">
        <h3>{badge.title}</h3>
        <span className="vp-professional-badge__badge">{VERIFIED_PROFESSIONALS_LABEL}</span>
      </header>

      <p className="vp-professional-badge__labels">{GROWING_TOGETHER_LABEL}</p>
      <p className="vp-professional-badge__professional">{badge.professionalName}</p>
      <p className="vp-professional-badge__description">{badge.description}</p>
      <p className="vp-professional-badge__status">{badge.statusLabel}</p>
    </article>
  );
}
