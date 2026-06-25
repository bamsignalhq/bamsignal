import { LAUNCH_DECISION_LABELS } from "../../../constants/launchCertification";
import type { LaunchCertificationReport } from "../../../types/launchCertification";
import { formatLaunchCertificationSummary } from "../../../utils/launchCertificationLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type LaunchCertificationReportCardProps = {
  report: LaunchCertificationReport;
};

const DECISION_STATUS: Record<LaunchCertificationReport["launchDecision"], "consistent" | "review" | "inconsistent"> = {
  go: "consistent",
  "go-with-conditions": "review",
  "no-go": "inconsistent"
};

export function LaunchCertificationReportCard({ report }: LaunchCertificationReportCardProps) {
  return (
    <section className="institutional-card launch-certification-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Launch certification report</h3>
        <p>Final institutional authority — assume launch tomorrow.</p>
      </header>

      <div className="launch-certification-report-card__hero">
        <strong>{report.overallReadinessScore}</strong>
        <span>/100</span>
        <InstitutionalStatusBadge
          status={DECISION_STATUS[report.launchDecision]}
          label={LAUNCH_DECISION_LABELS[report.launchDecision]}
        />
      </div>

      <p className="launch-certification-report-card__line">{formatLaunchCertificationSummary(report)}</p>
      <p className="launch-certification-report-card__detail">{report.launchDecisionDetail}</p>

      <div className="launch-certification-report-card__metrics">
        <article>
          <span>Certified domains</span>
          <strong>
            {report.certifiedDomainCount}/{report.subsystems.length}
          </strong>
        </article>
        <article>
          <span>Critical blockers</span>
          <strong>{report.criticalBlockers.length}</strong>
        </article>
        <article>
          <span>Warnings</span>
          <strong>{report.warnings.length}</strong>
        </article>
        <article>
          <span>Consolidation passed</span>
          <strong>{report.passedCheckCount}</strong>
        </article>
      </div>
    </section>
  );
}
