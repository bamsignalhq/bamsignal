import { PERFORMANCE_STATUS_LABELS } from "../../../constants/productionPerformance";
import type { PerformanceHealthReport } from "../../../types/productionPerformance";
import { formatPerformanceHealthSummaryLine } from "../../../utils/productionPerformanceLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type PerformanceHealthReportCardProps = {
  report: PerformanceHealthReport;
};

export function PerformanceHealthReportCard({ report }: PerformanceHealthReportCardProps) {
  return (
    <section className="institutional-card performance-health-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Performance health report</h3>
        <p>Bundle, lazy loading, caching, queries, and network efficiency without functionality changes.</p>
      </header>

      <div className="performance-health-report-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
        <InstitutionalStatusBadge
          status={report.overallStatus}
          label={PERFORMANCE_STATUS_LABELS[report.overallStatus]}
        />
      </div>

      <p className="performance-health-report-card__line">{formatPerformanceHealthSummaryLine(report)}</p>

      <div className="performance-health-report-card__metrics">
        <article>
          <span>Passed checks</span>
          <strong>{report.passedCheckCount}</strong>
        </article>
        <article>
          <span>Needs review</span>
          <strong>{report.reviewIssueCount}</strong>
        </article>
        <article>
          <span>Slow</span>
          <strong>{report.slowIssueCount}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{report.domains.length}</strong>
        </article>
      </div>

      <footer className="performance-health-report-card__foot">
        <p>Report generated {new Date(report.generatedAt).toLocaleString()}</p>
      </footer>
    </section>
  );
}
