import { ENGINEERING_HEALTH_STATUS_LABELS } from "../../../constants/enterpriseCodebaseCleanup";
import type { EngineeringHealthReport } from "../../../types/enterpriseCodebaseCleanup";
import { formatEngineeringHealthSummary } from "../../../utils/enterpriseCodebaseCleanupLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type EngineeringHealthReportCardProps = {
  report: EngineeringHealthReport;
};

const STATUS_BADGE: Record<
  EngineeringHealthReport["overallStatus"],
  "consistent" | "review" | "inconsistent"
> = {
  healthy: "consistent",
  review: "review",
  debt: "inconsistent"
};

export function EngineeringHealthReportCard({ report }: EngineeringHealthReportCardProps) {
  return (
    <section className="institutional-card engineering-health-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Engineering health report</h3>
        <p>
          Maintainability, readability, consistency, and long-term engineering health — no features, no
          architecture redesign.
        </p>
      </header>

      <div className="engineering-health-report-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
        <InstitutionalStatusBadge
          status={STATUS_BADGE[report.overallStatus]}
          label={ENGINEERING_HEALTH_STATUS_LABELS[report.overallStatus]}
        />
      </div>

      <p className="engineering-health-report-card__line">{formatEngineeringHealthSummary(report)}</p>

      <div className="engineering-health-report-card__metrics">
        <article>
          <span>Passed checks</span>
          <strong>{report.passedCheckCount}</strong>
        </article>
        <article>
          <span>Needs review</span>
          <strong>{report.reviewIssueCount}</strong>
        </article>
        <article>
          <span>Technical debt</span>
          <strong>{report.debtIssueCount}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{report.domains.length}</strong>
        </article>
      </div>

      <footer className="engineering-health-report-card__foot">
        <p>Report generated {new Date(report.generatedAt).toLocaleString()}</p>
      </footer>
    </section>
  );
}
