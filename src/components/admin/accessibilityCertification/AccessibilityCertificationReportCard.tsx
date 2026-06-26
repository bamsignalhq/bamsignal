import type { AccessibilityCertificationReport } from "../../../types/accessibilityCertification";
import { formatAccessibilityCertificationSummary } from "../../../utils/accessibilityCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type AccessibilityCertificationReportCardProps = {
  report: AccessibilityCertificationReport;
};

export function AccessibilityCertificationReportCard({
  report
}: AccessibilityCertificationReportCardProps) {
  return (
    <section className="institutional-card accessibility-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Accessibility score</h3>
        <p>Release gate — critical accessibility failures block deployment.</p>
      </header>

      <div className="accessibility-certification-report-card__hero">
        <strong>{report.accessibilityScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "secure" : "critical"} />
        <span>{report.passed ? "PASS" : "BLOCKED"}</span>
      </div>

      <p className="accessibility-certification-report-card__line">
        {formatAccessibilityCertificationSummary(report)}
      </p>

      <div className="accessibility-certification-report-card__metrics">
        <article>
          <span>Violations</span>
          <strong>{report.violations.length}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{report.counts.critical}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{report.domains.length}</strong>
        </article>
        <article>
          <span>Findings</span>
          <strong>{report.findings.length}</strong>
        </article>
      </div>
    </section>
  );
}
