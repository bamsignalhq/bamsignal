import type { RcCertificationReport } from "../../../types/rcCertification";
import { formatRcCertificationSummary } from "../../../utils/rcCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type RcCertificationReportCardProps = {
  report: RcCertificationReport;
};

const DECISION_STATUS: Record<
  RcCertificationReport["releaseDecision"],
  "consistent" | "review" | "inconsistent"
> = {
  go: "consistent",
  "go-with-conditions": "review",
  "no-go": "inconsistent"
};

export function RcCertificationReportCard({ report }: RcCertificationReportCardProps) {
  return (
    <section className="institutional-card rc-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Release candidate gate</h3>
        <p>Final certification — no production deployment without a passing RC.</p>
      </header>

      <div className="rc-certification-report-card__hero">
        <strong>{report.overallScore}%</strong>
        <InstitutionalStatusBadge status={DECISION_STATUS[report.releaseDecision]} />
        <span>{report.releaseDecisionLabel}</span>
      </div>

      <p className="rc-certification-report-card__line">{formatRcCertificationSummary(report)}</p>

      <div className="rc-certification-report-card__meta">
        <span>RC {report.rcNumber}</span>
        <span>Build {report.buildVersion} ({report.buildCode})</span>
        <span>Commit {report.gitCommitShort}</span>
        <span>{report.environment}</span>
      </div>

      <div className="rc-certification-report-card__metrics">
        <article>
          <span>Passed</span>
          <strong>
            {report.passedChecks}/{report.subsystemScores.length}
          </strong>
        </article>
        <article>
          <span>Blockers</span>
          <strong>{report.blockers.length}</strong>
        </article>
        <article>
          <span>Warnings</span>
          <strong>{report.warnings.length}</strong>
        </article>
        <article>
          <span>Gate</span>
          <strong>{report.passed ? "PASS" : "BLOCKED"}</strong>
        </article>
      </div>
    </section>
  );
}
