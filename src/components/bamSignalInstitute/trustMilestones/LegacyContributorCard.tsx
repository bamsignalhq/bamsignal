import {
  GROWING_TOGETHER_LABEL,
  LEGACY_CONTRIBUTOR_LABEL,
  LIFETIME_STEWARD_LABEL,
  RELATIONSHIP_WISDOM_LABEL,
  TRUST_JOURNEY_LABEL
} from "../../../constants/trustMilestones";
import type { LegacyContributorViewModel } from "../../../utils/trustMilestonesLogic";

type LegacyContributorCardProps = {
  contributor: LegacyContributorViewModel;
};

export function LegacyContributorCard({ contributor }: LegacyContributorCardProps) {
  return (
    <article className="tms-contributor-card institute-glass">
      <header className="tms-contributor-card__head">
        <h3>{contributor.name}</h3>
        <span className="tms-contributor-card__badge">
          {contributor.stewardLabel === LIFETIME_STEWARD_LABEL
            ? LIFETIME_STEWARD_LABEL
            : LEGACY_CONTRIBUTOR_LABEL}
        </span>
      </header>

      <p className="tms-contributor-card__labels">
        {TRUST_JOURNEY_LABEL} · {GROWING_TOGETHER_LABEL} · {RELATIONSHIP_WISDOM_LABEL}
      </p>
      <p className="tms-contributor-card__honor">{contributor.honorTitle}</p>
      <p className="tms-contributor-card__title">{contributor.title}</p>
      <p className="tms-contributor-card__focus">{contributor.focus}</p>
      <p className="tms-contributor-card__status">{contributor.statusLabel}</p>
    </article>
  );
}
