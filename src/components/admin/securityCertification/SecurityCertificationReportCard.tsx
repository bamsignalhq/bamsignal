import type { SecurityCertificationReport } from "../../../types/securityCertification";
import { formatSecurityCertificationSummary } from "../../../utils/securityCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type SecurityCertificationReportCardProps = {
  report: SecurityCertificationReport;
};

export function SecurityCertificationReportCard({ report }: SecurityCertificationReportCardProps) {
  return (
    <section className="institutional-card security-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Security score</h3>
        <p>Release gate — critical and high findings block deployment.</p>
      </header>

      <div className="security-certification-report-card__hero">
        <strong>{report.securityScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "consistent" : "inconsistent"} />
        <span>{report.passed ? "PASS" : "BLOCKED"}</span>
      </div>

      <p className="security-certification-report-card__line">
        {formatSecurityCertificationSummary(report)}
      </p>

      <div className="security-certification-report-card__metrics">
        <article>
          <span>Critical</span>
          <strong>{report.counts.critical}</strong>
        </article>
        <article>
          <span>High</span>
          <strong>{report.counts.high}</strong>
        </article>
        <article>
          <span>Medium</span>
          <strong>{report.counts.medium}</strong>
        </article>
        <article>
          <span>Low</span>
          <strong>{report.counts.low}</strong>
        </article>
      </div>
    </section>
  );
}
