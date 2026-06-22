import {
  COMMUNITY_JOURNEY_LABEL,
  GROWING_TOGETHER_LABEL
} from "../../../constants/globalCommunityRankings";
import type { CommunityMaturityViewModel } from "../../../utils/globalCommunityRankingsLogic";
import { CommunityBadge } from "./CommunityBadge";

type CommunityStatusCardProps = {
  community: CommunityMaturityViewModel;
};

export function CommunityStatusCard({ community }: CommunityStatusCardProps) {
  return (
    <section className="gcr-community-status-card signal-events-glass">
      <header className="gcr-community-status-card__head">
        <h3>{community.cityName}</h3>
        <CommunityBadge level={community.maturityLevel} primary />
      </header>

      <p className="gcr-community-status-card__labels">
        {COMMUNITY_JOURNEY_LABEL} · {GROWING_TOGETHER_LABEL}
      </p>

      <div className="gcr-community-status-card__meta">
        <span>{community.regionLabel}</span>
        {community.diaspora ? <span>Diaspora Community</span> : null}
      </div>

      <p className="gcr-community-status-card__summary">
        {community.reachedFactorCount} maturity signals preserved — not a popularity score.
      </p>
    </section>
  );
}
