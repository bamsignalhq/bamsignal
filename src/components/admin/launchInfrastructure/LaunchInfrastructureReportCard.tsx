import type { LaunchInfrastructureReport } from "../../../types/launchInfrastructure";
import { formatLaunchInfrastructureSummary } from "../../../utils/launchInfrastructureLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type LaunchInfrastructureReportCardProps = {
  report: LaunchInfrastructureReport;
};

const STATUS_BADGE: Record<
  LaunchInfrastructureReport["overallStatus"],
  "consistent" | "review" | "inconsistent"
> = {
  ready: "consistent",
  warning: "review",
  critical: "inconsistent"
};

const STATUS_LABEL = {
  ready: "Ready",
  warning: "Warning",
  critical: "Critical"
} as const;

export function LaunchInfrastructureReportCard({ report }: LaunchInfrastructureReportCardProps) {
  return (
    <section className="institutional-card launch-infra-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Launch infrastructure report</h3>
        <p>Docker, SEO artifacts, PWA, deep links, app links, and service worker verification.</p>
      </header>

      <div className="launch-infra-report-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
        <InstitutionalStatusBadge
          status={STATUS_BADGE[report.overallStatus]}
          label={STATUS_LABEL[report.overallStatus]}
        />
      </div>

      <p className="launch-infra-report-card__line">{formatLaunchInfrastructureSummary(report)}</p>

      <div className="launch-infra-report-card__metrics">
        <article>
          <span>Ready</span>
          <strong>{report.readyCount}</strong>
        </article>
        <article>
          <span>Warning</span>
          <strong>{report.warningCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{report.criticalCount}</strong>
        </article>
        <article>
          <span>Artifacts</span>
          <strong>{report.artifacts.length}</strong>
        </article>
      </div>
    </section>
  );
}
