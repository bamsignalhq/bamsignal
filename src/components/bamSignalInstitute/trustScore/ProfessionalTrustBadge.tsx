import {
  GROWING_TOGETHER_LABEL,
  PROFESSIONAL_TRUST_BADGE_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  TRUST_SCORE_NO_LEADERBOARD_COPY
} from "../../../constants/trustScoreInstitute";
import type { ProfessionalTrustBadgeViewModel } from "../../../utils/trustScoreInstituteLogic";

type ProfessionalTrustBadgeProps = {
  badge: ProfessionalTrustBadgeViewModel;
};

export function ProfessionalTrustBadge({ badge }: ProfessionalTrustBadgeProps) {
  return (
    <article className="tscr-badge-card institute-glass">
      <header className="tscr-badge-card__head">
        <h3>{badge.name}</h3>
        <span className="tscr-badge-card__badge">{PROFESSIONAL_TRUST_BADGE_LABEL}</span>
      </header>

      <p className="tscr-badge-card__labels">
        {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL} · {TRUST_SCORE_NO_LEADERBOARD_COPY}
      </p>
      <p className="tscr-badge-card__level">{badge.levelTitle}</p>
      <p className="tscr-badge-card__title">{badge.title}</p>
      <p className="tscr-badge-card__focus">{badge.focus}</p>
      <p className="tscr-badge-card__status">{badge.statusLabel}</p>
    </article>
  );
}
