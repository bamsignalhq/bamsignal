import { UX_STATUS_LABELS } from "../../../constants/uxConsistency";
import type { UxConsistencyReport } from "../../../types/uxConsistency";
import { formatUxSummaryLine } from "../../../utils/uxConsistencyLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type UxConsistencyReportCardProps = {
  report: UxConsistencyReport;
};

export function UxConsistencyReportCard({ report }: UxConsistencyReportCardProps) {
  return (
    <section className="institutional-card ux-consistency-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>UX consistency report</h3>
        <p>Typography, spacing, buttons, cards, states, navigation, and theme alignment across BamSignal.</p>
      </header>

      <div className="ux-consistency-report-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
        <InstitutionalStatusBadge status={report.overallStatus} label={UX_STATUS_LABELS[report.overallStatus]} />
      </div>

      <p className="ux-consistency-report-card__line">{formatUxSummaryLine(report)}</p>

      <div className="ux-consistency-report-card__metrics">
        <article>
          <span>Passed checks</span>
          <strong>{report.passedCheckCount}</strong>
        </article>
        <article>
          <span>Needs review</span>
          <strong>{report.reviewIssueCount}</strong>
        </article>
        <article>
          <span>Inconsistent</span>
          <strong>{report.inconsistentIssueCount}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{report.domains.length}</strong>
        </article>
      </div>

      <footer className="ux-consistency-report-card__foot">
        <p>Report generated {new Date(report.generatedAt).toLocaleString()}</p>
      </footer>
    </section>
  );
}
