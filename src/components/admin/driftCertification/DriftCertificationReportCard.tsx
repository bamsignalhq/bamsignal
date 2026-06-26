import type { DriftCertificationReport } from "../../../types/driftCertification";
import { formatDriftCertificationSummary } from "../../../utils/driftCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type DriftCertificationReportCardProps = {
  report: DriftCertificationReport;
};

export function DriftCertificationReportCard({ report }: DriftCertificationReportCardProps) {
  return (
    <section className="institutional-card drift-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Drift score</h3>
        <p>Release gate — critical configuration drift blocks deployment.</p>
      </header>

      <div className="drift-certification-report-card__hero">
        <strong>{report.driftScore}%</strong>
        <InstitutionalStatusBadge status={report.passed ? "consistent" : "inconsistent"} />
        <span>{report.passed ? "PASS" : "BLOCKED"}</span>
      </div>

      <p className="drift-certification-report-card__line">{formatDriftCertificationSummary(report)}</p>

      <div className="drift-certification-report-card__metrics">
        <article>
          <span>Drift</span>
          <strong>{report.unexpectedDrift}</strong>
        </article>
        <article>
          <span>Missing</span>
          <strong>{report.missingSecrets}</strong>
        </article>
        <article>
          <span>Unused</span>
          <strong>{report.unusedSecrets.length}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{report.counts.critical}</strong>
        </article>
      </div>
    </section>
  );
}
