import type { PerformanceCenterSummary } from "../../../types/performanceCenter";
import { PERFORMANCE_HEALTH_STATUS_LABELS } from "../../../constants/performanceCenter";
import { formatPerformanceSummaryLine } from "../../../utils/performanceCenterLogic";

type PerformanceOverviewCardProps = {
  summary: PerformanceCenterSummary;
};

export function PerformanceOverviewCard({ summary }: PerformanceOverviewCardProps) {
  return (
    <section className="performance-center-card performance-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="performance-center-card__head">
        <h3>Performance overview</h3>
        <p>Institutional capacity planning — scale from hundreds to millions without surprises.</p>
      </header>
      <div className="performance-overview-card__score">
        <span>Health score</span>
        <strong>{summary.healthScore}%</strong>
        <span
          className={`performance-overview-card__status performance-overview-card__status--${summary.healthStatus}`}
        >
          {PERFORMANCE_HEALTH_STATUS_LABELS[summary.healthStatus]}
        </span>
      </div>
      <p className="performance-center-card__line">{formatPerformanceSummaryLine(summary)}</p>
      <div className="performance-center-card__grid">
        <article>
          <span>Avg response</span>
          <strong>{summary.avgResponseMs}ms</strong>
        </article>
        <article>
          <span>P95</span>
          <strong>{summary.p95Ms}ms</strong>
        </article>
        <article>
          <span>P99</span>
          <strong>{summary.p99Ms}ms</strong>
        </article>
        <article>
          <span>Cache hit</span>
          <strong>{summary.cacheHitPercent}%</strong>
        </article>
        <article>
          <span>Headroom</span>
          <strong>{summary.remainingHeadroomPercent}%</strong>
        </article>
        <article>
          <span>Open optimizations</span>
          <strong>{summary.openOptimizations}</strong>
        </article>
      </div>
    </section>
  );
}
