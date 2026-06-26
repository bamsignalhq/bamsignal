import { QA_RELEASE_GATE_STATUS_LABELS } from "../../../constants/qualityAssuranceCenter";
import type { QACertificationSummary } from "../../../types/qualityAssuranceCenter";
import { formatCertificationSummaryLine } from "../../../utils/qualityAssuranceCenterLogic";

type QACertificationSummaryCardProps = {
  summary: QACertificationSummary;
};

export function QACertificationSummaryCard({ summary }: QACertificationSummaryCardProps) {
  return (
    <section className="qa-certification-card qa-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="qa-certification-card__head">
        <h3>Certification summary</h3>
        <p>Single source of truth for release readiness — every production release passes through here.</p>
      </header>
      <div className="qa-summary-card__hero">
        <strong>{summary.overallScore}%</strong>
        <span className={`qa-summary-card__status${summary.releaseBlocked ? " is-blocked" : ""}`}>
          {summary.releaseBlocked ? "RELEASE BLOCKED" : "RELEASE CLEARED"}
        </span>
      </div>
      <p className="qa-summary-card__line">{formatCertificationSummaryLine(summary)}</p>
      <div className="qa-summary-card__grid">
        <article>
          <span>Pass gates</span>
          <strong>{summary.passCount}</strong>
        </article>
        <article>
          <span>Warnings</span>
          <strong>{summary.warningCount}</strong>
        </article>
        <article>
          <span>Failed</span>
          <strong>{summary.failedCount}</strong>
        </article>
        <article>
          <span>Automated pass</span>
          <strong>{summary.automatedPassRate}%</strong>
        </article>
        <article>
          <span>Manual pass</span>
          <strong>{summary.manualPassRate}%</strong>
        </article>
      </div>
      <p className="qa-certification-card__note">
        Failed release gates block deployment. {QA_RELEASE_GATE_STATUS_LABELS.failed} gates are blocking.
      </p>
    </section>
  );
}
