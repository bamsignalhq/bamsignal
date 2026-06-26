import type { ReliabilityCertificationReport } from "../../../types/reliabilityCertification";
import { formatReliabilityCertificationSummary } from "../../../utils/reliabilityCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type ReliabilityCertificationReportCardProps = {
  report: ReliabilityCertificationReport;
};

export function ReliabilityCertificationReportCard({ report }: ReliabilityCertificationReportCardProps) {
  const total = report.scenarios.length;

  return (
    <section className="institutional-card reliability-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Reliability score</h3>
        <p>Failure simulation gate — every scenario must recover gracefully.</p>
      </header>

      <div className="reliability-certification-report-card__hero">
        <strong>{report.reliabilityScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "consistent" : "inconsistent"} />
        <span>{report.passed ? "PASS" : "BLOCKED"}</span>
      </div>

      <p className="reliability-certification-report-card__line">
        {formatReliabilityCertificationSummary(report)}
      </p>

      <div className="reliability-certification-report-card__metrics">
        <article>
          <span>Recovery success</span>
          <strong>
            {report.recoverySuccess}/{total || "—"}
          </strong>
        </article>
        <article>
          <span>Avg recovery</span>
          <strong>{report.recoveryTimeMs.average ?? "—"} ms</strong>
        </article>
        <article>
          <span>Max recovery</span>
          <strong>{report.recoveryTimeMs.max ?? "—"} ms</strong>
        </article>
        <article>
          <span>Failures</span>
          <strong>{report.recoveryFailures.length}</strong>
        </article>
      </div>
    </section>
  );
}
