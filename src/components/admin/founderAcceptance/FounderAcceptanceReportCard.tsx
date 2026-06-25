import type { FounderAcceptanceReport } from "../../../types/founderAcceptance";
import { FAT_GO_LABELS } from "../../../constants/founderAcceptance";
import { formatFounderAcceptanceSummary } from "../../../utils/founderAcceptanceLogic";
import { InstitutionalStatusBadge } from "../shared/InstitutionalStatusBadge";

type FounderAcceptanceReportCardProps = {
  report: FounderAcceptanceReport;
};

const DECISION_BADGE: Record<
  FounderAcceptanceReport["goDecision"],
  "consistent" | "review" | "inconsistent"
> = {
  go: "consistent",
  "go-with-conditions": "review",
  "no-go": "inconsistent"
};

export function FounderAcceptanceReportCard({ report }: FounderAcceptanceReportCardProps) {
  return (
    <section className="institutional-card fat-report-card concierge-consultant-card--glass cc-reveal">
      <header className="institutional-card__head">
        <h3>Founder acceptance report</h3>
        <p>Launch-tomorrow walkthrough across every persona and major workflow.</p>
      </header>

      <div className="fat-report-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
        <InstitutionalStatusBadge
          status={DECISION_BADGE[report.goDecision]}
          label={FAT_GO_LABELS[report.goDecision]}
        />
      </div>

      <p className="fat-report-card__line">{formatFounderAcceptanceSummary(report)}</p>

      <div className="fat-report-card__metrics">
        <article>
          <span>Passed</span>
          <strong>{report.passedCount}</strong>
        </article>
        <article>
          <span>Warnings</span>
          <strong>{report.warningCount}</strong>
        </article>
        <article>
          <span>Critical</span>
          <strong>{report.criticalCount}</strong>
        </article>
        <article>
          <span>Test scripts</span>
          <strong>
            {report.testSuite.passed}/{report.testSuite.total}
          </strong>
        </article>
      </div>
    </section>
  );
}
