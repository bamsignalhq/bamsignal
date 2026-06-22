import type { CommunityOverviewSnapshot } from "../../../types/executiveDashboard";

type CommunityOverviewCardProps = {
  snapshot: CommunityOverviewSnapshot;
};

export function CommunityOverviewCard({ snapshot }: CommunityOverviewCardProps) {
  return (
    <section className="community-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="community-overview-card__head">
        <h3>Communities</h3>
        <p>City and corridor reach across Nigeria and diaspora.</p>
      </header>

      <div className="community-overview-card__metrics">
        <article>
          <p>Active cities</p>
          <strong>{snapshot.activeCities}</strong>
        </article>
        <article>
          <p>Corridors</p>
          <strong>{snapshot.corridors}</strong>
        </article>
      </div>

      <p className="community-overview-card__reach">
        Diaspora reach: {snapshot.diasporaReach}
      </p>
    </section>
  );
}
