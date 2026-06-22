import {
  LEGACY_STATUS_LABEL,
  MILESTONES_LABEL,
  PROFESSIONAL_CONTRIBUTIONS_LABEL,
  TRUST_JOURNEY_LABEL,
  TRUST_LEVEL_LABEL,
  TRUST_SCORE_NO_FIVE_STAR_COPY,
  TRUST_SCORE_NO_POPULARITY_COPY,
  TRUST_SCORE_NO_STARS_COPY,
  YEARS_ACTIVE_LABEL
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
        {TRUST_SCORE_NO_STARS_COPY} · {TRUST_SCORE_NO_FIVE_STAR_COPY} · {TRUST_SCORE_NO_POPULARITY_COPY}
      </p>
      <dl className="tscr-level-card__display">
        <div>
          <dt>{TRUST_JOURNEY_LABEL}</dt>
          <dd>{level.trustJourney}</dd>
        </div>
        <div>
          <dt>{YEARS_ACTIVE_LABEL}</dt>
          <dd>{level.yearsActive}</dd>
        </div>
        <div>
          <dt>{MILESTONES_LABEL}</dt>
          <dd>{level.milestonesLabel}</dd>
        </div>
        <div>
          <dt>{PROFESSIONAL_CONTRIBUTIONS_LABEL}</dt>
          <dd>{level.contributions}</dd>
        </div>
        <div>
          <dt>{LEGACY_STATUS_LABEL}</dt>
          <dd>{level.legacyStatus}</dd>
        </div>
      </dl>
      <p className="tscr-level-card__description">{level.description}</p>
      <p className="tscr-level-card__status">{level.statusLabel}</p>
    </article>
  );
}
