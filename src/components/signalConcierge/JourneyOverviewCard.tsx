import {
  MEMBER_JOURNEY_DASHBOARD_BRAND,
  MEMBER_JOURNEY_HEALTH_LABELS,
  MEMBER_JOURNEY_ID_LABEL,
  MEMBER_JOURNEY_READ_ONLY_COPY,
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
        <p className="journey-overview-card__brand">{MEMBER_JOURNEY_DASHBOARD_BRAND}</p>
        <h2>{overview.memberName}</h2>
        <p className="journey-overview-card__narrative">{overview.narrative}</p>
        <p className="journey-overview-card__readonly">{MEMBER_JOURNEY_READ_ONLY_COPY}</p>
      </header>
      <dl className="journey-overview-card__grid">
        <div className="journey-overview-card__journey-id">
          <dt>{MEMBER_JOURNEY_ID_LABEL}</dt>
          <dd>{overview.journeyId ?? "Pending"}</dd>
        </div>
        <div>
          <dt>Current status</dt>
          <dd>{overview.statusLabel}</dd>
        </div>
        <div>
          <dt>Assigned consultant</dt>
          <dd>{overview.consultantName ?? "Awaiting assignment"}</dd>
        </div>
        <div>
          <dt>Tier</dt>
          <dd>{overview.tierLabel ?? "Not selected yet"}</dd>
        </div>
        <div>
          <dt>Date joined</dt>
          <dd>
            <time dateTime={overview.dateJoined}>{new Date(overview.dateJoined).toLocaleDateString()}</time>
          </dd>
        </div>
        <div>
          <dt>Last update</dt>
          <dd>
            <time dateTime={overview.lastUpdate}>{new Date(overview.lastUpdate).toLocaleString()}</time>
          </dd>
        </div>
        <div>
          <dt>Journey stage</dt>
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
      </dl>
    </section>
  );
}
