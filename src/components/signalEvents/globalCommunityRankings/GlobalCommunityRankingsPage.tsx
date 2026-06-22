import { useMemo } from "react";
import {
  COMMUNITY_GROWTH_LABEL,
  COMMUNITY_JOURNEY_LABEL,
  COMMUNITY_MATURITY_FUTURE_CAPABILITIES,
  COMMUNITY_MATURITY_LEVELS,
  GLOBAL_COMMUNITY_RANKINGS_PURPOSE_COPY,
  GLOBAL_COMMUNITY_RANKINGS_RESERVED_COPY,
  GLOBAL_COMMUNITY_RANKINGS_SUBCOPY,
  GLOBAL_COMMUNITY_RANKINGS_TITLE,
  GROWING_TOGETHER_LABEL,
  LEGACY_COMMUNITY_LABEL
} from "../../../constants/globalCommunityRankings";
import { getGlobalCommunityRankingsBundle } from "../../../utils/GlobalCommunityRankingsEngine";
import { CommunityBadge } from "./CommunityBadge";
import { CommunityGrowthCard } from "./CommunityGrowthCard";
import { CommunityMilestoneTimeline } from "./CommunityMilestoneTimeline";
import { CommunityStatusCard } from "./CommunityStatusCard";

export function GlobalCommunityRankingsPage() {
  const bundle = useMemo(() => getGlobalCommunityRankingsBundle(), []);

  return (
    <div className="gcr-page">
      <header className="gcr-page__hero signal-events-glass">
        <p className="se-hub-page__eyebrow">{COMMUNITY_JOURNEY_LABEL}</p>
        <h1>{GLOBAL_COMMUNITY_RANKINGS_TITLE}</h1>
        <p>{GLOBAL_COMMUNITY_RANKINGS_SUBCOPY}</p>
        <p className="gcr-page__labels">
          {COMMUNITY_GROWTH_LABEL} · {GROWING_TOGETHER_LABEL} · {LEGACY_COMMUNITY_LABEL}
        </p>
        <p className="gcr-page__purpose">{GLOBAL_COMMUNITY_RANKINGS_PURPOSE_COPY}</p>
      </header>

      <section className="gcr-page__levels signal-events-glass">
        <h2>Community levels</h2>
        <p>Maturity stages — never a leaderboard.</p>
        <ul className="gcr-page__level-list">
          {COMMUNITY_MATURITY_LEVELS.map((level) => (
            <li key={level.id}>
              <CommunityBadge level={level.id} />
              <span>{level.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="gcr-page__section">
        <header className="se-section-head">
          <h2>Example communities</h2>
          <p>Architecture preview — alphabetical, not ranked.</p>
        </header>
        <div className="gcr-page__grid">
          {bundle.communities.map((community) => (
            <CommunityStatusCard key={community.citySlug} community={community} />
          ))}
        </div>
      </section>

      {bundle.communities.map((community) => (
        <div key={`${community.citySlug}-detail`} className="gcr-page__detail">
          <CommunityGrowthCard community={community} />
          <CommunityMilestoneTimeline
            cityName={community.cityName}
            milestones={community.milestones}
          />
        </div>
      ))}

      <section className="gcr-page__future signal-events-glass">
        <h2>Future ready</h2>
        <ul>
          {COMMUNITY_MATURITY_FUTURE_CAPABILITIES.map((capability) => (
            <li key={capability.id}>
              <strong>{capability.label}</strong>
              <span>{capability.description}</span>
            </li>
          ))}
        </ul>
        <p className="gcr-page__reserved">{GLOBAL_COMMUNITY_RANKINGS_RESERVED_COPY}</p>
      </section>
    </div>
  );
}
