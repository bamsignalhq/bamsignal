import type { FounderCertificationReport } from "../../../types/founderCertification";
import {
  decisionBadgeStatus,
  formatFounderCertificationSummary
} from "../../../utils/founderCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type FounderCertificationReportCardProps = {
  report: FounderCertificationReport;
};

export function FounderCertificationReportCard({ report }: FounderCertificationReportCardProps) {
  return (
    <section className="institutional-card founder-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Launch decision</h3>
        <p>Master certification — all subsystems combined into one founder authority.</p>
      </header>

      <div className="founder-certification-report-card__hero">
        <strong>{report.releaseDecisionLabel}</strong>
        <InstitutionalStatusBadge status={decisionBadgeStatus(report.releaseDecision)} />
        <span>{report.overallScore}%</span>
      </div>

      <p className="founder-certification-report-card__line">{formatFounderCertificationSummary(report)}</p>
      <p className="founder-certification-report-card__candidate">
        Release candidate: <strong>{report.releaseCandidate}</strong>
      </p>
      <p>{report.releaseDecisionDetail}</p>

      <div className="founder-certification-report-card__metrics">
        <article>
          <span>Critical</span>
          <strong>{report.criticalIssues.length}</strong>
        </article>
        <article>
          <span>Warnings</span>
          <strong>{report.warnings.length}</strong>
        </article>
        <article>
          <span>Resolved</span>
          <strong>{report.resolvedSinceLastRelease.length}</strong>
        </article>
        <article>
          <span>Subsystems</span>
          <strong>{report.subsystemScores.length}</strong>
        </article>
      </div>
    </section>
  );
}
