import type { SecurityOpsCenterSummary } from "../../../types/securityOperationsCenter";
import { formatSecurityOpsSummaryLine } from "../../../utils/securityOperationsCenterLogic";

type SecurityOpsSummaryCardProps = {
  summary: SecurityOpsCenterSummary;
};

export function SecurityOpsSummaryCard({ summary }: SecurityOpsSummaryCardProps) {
  return (
    <section className="security-ops-card security-ops-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="security-ops-card__head">
        <h3>Platform security overview</h3>
        <p>Centralized security events — not moderation. Authentication, authorization, and abuse signals.</p>
      </header>
      <div className="security-ops-summary-card__hero">
        <strong>{summary.overallScore}%</strong>
        <span>Security score</span>
      </div>
      <p className="security-ops-summary-card__line">{formatSecurityOpsSummaryLine(summary)}</p>
      <div className="security-ops-summary-card__grid">
        <article>
          <span>Open incidents</span>
          <strong>{summary.openIncidents}</strong>
        </article>
        <article>
          <span>Events (24h)</span>
          <strong>{summary.events24h}</strong>
        </article>
        <article>
          <span>Critical events</span>
          <strong>{summary.criticalEvents}</strong>
        </article>
        <article>
          <span>Blocked attempts</span>
          <strong>{summary.blockedAttempts}</strong>
        </article>
      </div>
    </section>
  );
}
