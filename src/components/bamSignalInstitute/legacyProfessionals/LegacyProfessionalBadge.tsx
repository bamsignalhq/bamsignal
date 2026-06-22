import {
  GROWING_TOGETHER_LABEL,
  HALL_OF_TRUST_LABEL,
  LEGACY_PROFESSIONAL_BADGE_LABEL,
  LEGACY_PROFESSIONALS_FORBIDDEN_COPY,
  RELATIONSHIP_WISDOM_LABEL
} from "../../../constants/legacyProfessionals";
import type { LegacyProfessionalBadgeViewModel } from "../../../utils/legacyProfessionalsLogic";

type LegacyProfessionalBadgeProps = {
  badge: LegacyProfessionalBadgeViewModel;
};

export function LegacyProfessionalBadge({ badge }: LegacyProfessionalBadgeProps) {
  return (
    <article className="lgpr-badge-card institute-glass">
      <header className="lgpr-badge-card__head">
        <h3>{badge.title}</h3>
        <span className="lgpr-badge-card__badge">{LEGACY_PROFESSIONAL_BADGE_LABEL}</span>
      </header>

      <p className="lgpr-badge-card__labels">
        {HALL_OF_TRUST_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="lgpr-badge-card__honor">{badge.honorLabel}</p>
      <p className="lgpr-badge-card__role">{badge.roleTitle}</p>
      <p className="lgpr-badge-card__description">{badge.description}</p>
      <p className="lgpr-badge-card__forbidden">
        Not {LEGACY_PROFESSIONALS_FORBIDDEN_COPY.join(" or ")}.
      </p>
      <p className="lgpr-badge-card__status">{badge.statusLabel}</p>
    </article>
  );
}
