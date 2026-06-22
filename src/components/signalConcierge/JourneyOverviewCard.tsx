import {
  MEMBER_DASHBOARD_BRAND,
  MEMBER_JOURNEY_HEALTH_LABELS,
  MEMBER_JOURNEY_STAGE_LABELS
} from "../../constants/memberDashboard";
import type { MemberDashboardOverview } from "../../types/memberDashboard";

type JourneyOverviewCardProps = {
  overview: MemberDashboardOverview;
};

export function JourneyOverviewCard({ overview }: JourneyOverviewCardProps) {
  return (
    <section className="member-dashboard-card journey-overview-card signal-concierge-glass sc-reveal">
      <header className="journey-overview-card__head">
        <p className="journey-overview-card__brand">{MEMBER_DASHBOARD_BRAND}</p>
        <h2>{overview.memberName}</h2>
        <p className="journey-overview-card__narrative">{overview.narrative}</p>
      </header>
      <dl className="journey-overview-card__grid">
        <div>
          <dt>Current stage</dt>
          <dd>
            <span className="journey-overview-card__stage">
              {MEMBER_JOURNEY_STAGE_LABELS[overview.currentStage]}
            </span>
          </dd>
        </div>
        <div>
          <dt>Journey health</dt>
          <dd>
            <span className={`journey-overview-card__health journey-overview-card__health--${overview.health}`}>
              {MEMBER_JOURNEY_HEALTH_LABELS[overview.health]}
            </span>
          </dd>
        </div>
        {overview.journeyId ? (
          <div className="journey-overview-card__journey-id">
            <dt>Journey ID</dt>
            <dd>{overview.journeyId}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
