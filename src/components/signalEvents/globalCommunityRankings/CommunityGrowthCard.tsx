import { COMMUNITY_GROWTH_LABEL } from "../../../constants/globalCommunityRankings";
import type { CommunityMaturityViewModel } from "../../../utils/globalCommunityRankingsLogic";

type CommunityGrowthCardProps = {
  community: CommunityMaturityViewModel;
};

export function CommunityGrowthCard({ community }: CommunityGrowthCardProps) {
  return (
    <section className="gcr-community-growth-card signal-events-glass">
      <header className="gcr-community-growth-card__head">
        <h3>{COMMUNITY_GROWTH_LABEL}</h3>
        <p>{community.cityName} — maturity factors, never competition.</p>
      </header>

      <ul className="gcr-community-growth-card__list">
        {community.factors.map((factor) => (
          <li
            key={factor.id}
            className={`gcr-community-growth-card__item${factor.reached ? " is-reached" : ""}`}
          >
            <span className="gcr-community-growth-card__dot" aria-hidden />
            <div>
              <strong>{factor.label}</strong>
              <p>{factor.description}</p>
              <span className="gcr-community-growth-card__state">
                {factor.reached ? "Preserved" : "Forming"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
