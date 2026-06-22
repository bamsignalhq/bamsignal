import {
  TRUST_LEVEL_LABEL,
  TRUST_SCORE_NO_FIVE_STAR_COPY,
  TRUST_SCORE_NO_LEADERBOARD_COPY,
  TRUST_SCORE_NO_STARS_COPY
} from "../../../constants/trustScoreInstitute";
import type { TrustScoreLevelViewModel } from "../../../utils/trustScoreInstituteLogic";

type TrustScoreCardProps = {
  level: TrustScoreLevelViewModel;
};

export function TrustScoreCard({ level }: TrustScoreCardProps) {
  return (
    <article className="tscr-level-card institute-glass">
      <header className="tscr-level-card__head">
        <h3>{level.title}</h3>
        <span className="tscr-level-card__badge">{TRUST_LEVEL_LABEL}</span>
      </header>

      <p className="tscr-level-card__labels">
        {TRUST_SCORE_NO_STARS_COPY} · {TRUST_SCORE_NO_FIVE_STAR_COPY}
      </p>
      <p className="tscr-level-card__description">{level.description}</p>
      <p className="tscr-level-card__status">{level.statusLabel}</p>
    </article>
  );
}
