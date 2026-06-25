import { SECURITY_STATUS_LABELS } from "../../../constants/productionSecurity";
import type { SecurityHealthReport } from "../../../types/productionSecurity";
import { formatSecuritySummaryLine } from "../../../utils/productionSecurityLogic";

type SecurityHealthReportCardProps = {
  report: SecurityHealthReport;
};

export function SecurityHealthReportCard({ report }: SecurityHealthReportCardProps) {
  return (
    <section className="production-security-card security-health-report-card concierge-consultant-card--glass cc-reveal">
      <header className="production-security-card__head">
        <h3>Security health report</h3>
        <p>Production hardening status across authentication, authorization, headers, and data exposure.</p>
      </header>

      <div className="security-health-report-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
        <span className={`security-status-badge security-status-badge--${report.overallStatus}`}>
          {SECURITY_STATUS_LABELS[report.overallStatus]}
        </span>
      </div>

      <p className="production-security-card__line">{formatSecuritySummaryLine(report)}</p>

      <div className="security-health-report-card__metrics">
        <article>
          <span>Passed checks</span>
          <strong>{report.passedCheckCount}</strong>
        </article>
        <article>
          <span>Warnings</span>
          <strong>{report.warningIssueCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{report.criticalIssueCount}</strong>
        </article>
        <article>
          <span>Domains</span>
          <strong>{report.domains.length}</strong>
        </article>
      </div>

      <footer className="production-security-card__foot">
        <p>Report generated {new Date(report.generatedAt).toLocaleString()}</p>
      </footer>
    </section>
  );
}
