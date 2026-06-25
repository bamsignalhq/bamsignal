import type { ReportingCenterSummary } from "../../../types/reportingCenter";
import { formatReportingSummaryLine } from "../../../utils/reportingCenterLogic";

type ReportSummaryCardProps = {
  summary: ReportingCenterSummary;
};

export function ReportSummaryCard({ summary }: ReportSummaryCardProps) {
  return (
    <section className="reporting-center-card report-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="reporting-center-card__head">
        <h3>Reporting overview</h3>
        <p>
          Operational dashboards show live information. Reporting preserves institutional knowledge
          over time.
        </p>
      </header>
      <p className="reporting-center-card__line">{formatReportingSummaryLine(summary)}</p>
      <div className="reporting-center-card__grid">
        <article>
          <span>Total reports</span>
          <strong>{summary.totalReports}</strong>
        </article>
        <article>
          <span>Published</span>
          <strong>{summary.publishedReports}</strong>
        </article>
        <article>
          <span>Scheduled</span>
          <strong>{summary.scheduledReports}</strong>
        </article>
        <article>
          <span>Exports / 30d</span>
          <strong>{summary.exportsLast30d}</strong>
        </article>
        <article>
          <span>Preserved runs</span>
          <strong>{summary.preservedRuns}</strong>
        </article>
        <article>
          <span>Categories</span>
          <strong>{summary.categoriesCovered}</strong>
        </article>
      </div>
    </section>
  );
}
