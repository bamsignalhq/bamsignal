import type { PerformanceEngineeringSummary } from "../../../types/performanceCenter";
import { PERFORMANCE_HEALTH_STATUS_LABELS } from "../../../constants/performanceCenter";

type PerformanceEngineeringSummaryCardProps = {
  summary: PerformanceEngineeringSummary;
};

export function PerformanceEngineeringSummaryCard({
  summary
}: PerformanceEngineeringSummaryCardProps) {
  return (
    <section className="performance-center-card performance-engineering-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Performance engineering overview</h3>
        <p>
          Application performance — startup, web vitals, API latency, bundle size, and database
          health. Compare current against previous release and historical windows.
        </p>
      </header>
      <div className="performance-overview-card__score">
        <span>Engineering score</span>
        <strong>{summary.engineeringScore}%</strong>
        <span
          className={`performance-overview-card__status performance-overview-card__status--${summary.healthStatus}`}
        >
          {PERFORMANCE_HEALTH_STATUS_LABELS[summary.healthStatus]}
        </span>
      </div>
      <div className="performance-center-card__grid">
        <article>
          <span>Tracks</span>
          <strong>{summary.trackCount}</strong>
        </article>
        <article>
          <span>Regressions</span>
          <strong>{summary.regressionsCount}</strong>
        </article>
        <article>
          <span>Improvements</span>
          <strong>{summary.improvementsCount}</strong>
        </article>
        <article>
          <span>Recommendations</span>
          <strong>{summary.recommendationsCount}</strong>
        </article>
      </div>
    </section>
  );
}
