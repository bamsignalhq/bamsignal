import type { RelationshipMilestoneSummary } from "../../types/memberDashboard";

type RelationshipMilestoneSummaryCardProps = {
  milestones: RelationshipMilestoneSummary;
};

export function RelationshipMilestoneSummaryCard({ milestones }: RelationshipMilestoneSummaryCardProps) {
  return (
    <section className="member-dashboard-card relationship-milestone-summary-card signal-concierge-glass sc-reveal">
      <header className="member-dashboard-card__head">
        <h3>Relationship milestones</h3>
        <p>Celebrated privately within your journey.</p>
      </header>
      <p className="relationship-milestone-summary-card__count">
        {milestones.count} milestone{milestones.count === 1 ? "" : "s"}
      </p>
      {milestones.latestLabel ? (
        <p className="relationship-milestone-summary-card__latest">{milestones.latestLabel}</p>
      ) : null}
      {milestones.latestAt ? (
        <time dateTime={milestones.latestAt} className="relationship-milestone-summary-card__date">
          {new Date(milestones.latestAt).toLocaleDateString()}
        </time>
      ) : null}
      <p className="relationship-milestone-summary-card__detail">{milestones.detail}</p>
    </section>
  );
}
