import type { LaunchControlSummary } from "../../../types/launchControlCenter";
import { formatLaunchSummaryLine } from "../../../utils/launchControlCenterLogic";

type LaunchHealthCardProps = {
  summary: LaunchControlSummary;
};

export function LaunchHealthCard({ summary }: LaunchHealthCardProps) {
  return (
    <section className="launch-control-card launch-health-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-control-card__head">
        <h3>Launch health</h3>
        <p>Final operational cockpit — measurable readiness before public launch.</p>
      </header>
      <div className="launch-health-card__score">
        <span>Overall readiness</span>
        <strong>{summary.overallReadinessPercent}%</strong>
        <span className={`launch-health-card__go launch-health-card__go--${summary.goNoGoRecommendation}`}>
          {summary.goNoGoRecommendation.toUpperCase()}
        </span>
      </div>
      <p className="launch-control-card__line">{formatLaunchSummaryLine(summary)}</p>
      <div className="launch-control-card__grid">
        <article>
          <span>Ready</span>
          <strong>{summary.readyCount}</strong>
        </article>
        <article>
          <span>Needs attention</span>
          <strong>{summary.needsAttentionCount}</strong>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blockedCount}</strong>
        </article>
        <article>
          <span>Not started</span>
          <strong>{summary.notStartedCount}</strong>
        </article>
        <article>
          <span>Critical issues</span>
          <strong>{summary.criticalIssues}</strong>
        </article>
      </div>
    </section>
  );
}
