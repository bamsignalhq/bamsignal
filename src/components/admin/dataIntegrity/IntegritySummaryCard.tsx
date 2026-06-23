import { INTEGRITY_STATUS_LABELS } from "../../../constants/dataIntegrity";
import type { IntegritySummary } from "../../../types/dataIntegrity";

type IntegritySummaryCardProps = {
  summary: IntegritySummary;
  generatedAt: string;
  checkCount: number;
};

export function IntegritySummaryCard({ summary, generatedAt, checkCount }: IntegritySummaryCardProps) {
  return (
    <section className="integrity-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="integrity-summary-card__head">
        <h3>Integrity summary</h3>
        <p>
          Continuous institutional consistency — overall:{" "}
          <span className={`integrity-status-badge integrity-status-badge--${summary.overallStatus}`}>
            {INTEGRITY_STATUS_LABELS[summary.overallStatus]}
          </span>
        </p>
      </header>

      <div className="integrity-summary-card__hero">
        <strong>{summary.score}</strong>
        <span>/100</span>
      </div>

      <div className="integrity-summary-card__metrics">
        <Metric label="Checks run" value={String(checkCount)} tone="neutral" />
        <Metric label="Healthy" value={String(summary.healthyChecks)} tone="healthy" />
        <Metric label="Warning" value={String(summary.warningChecks)} tone="warning" />
        <Metric label="Critical" value={String(summary.criticalChecks)} tone="critical" />
        <Metric label="Total issues" value={String(summary.totalIssues)} tone="issues" />
      </div>

      <footer className="integrity-summary-card__foot">
        <p>Last verified {new Date(generatedAt).toLocaleString()}</p>
      </footer>
    </section>
  );
}

function Metric({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "neutral" | "healthy" | "warning" | "critical" | "issues";
}) {
  return (
    <article className={`integrity-summary-metric integrity-summary-metric--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
