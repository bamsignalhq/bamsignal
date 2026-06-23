import { HEALTH_STATUS_LABELS } from "../../../constants/institutionalReadiness";
import type { InstitutionalReadinessReport } from "../../../types/institutionalReadiness";

type ReadinessScoreCardProps = {
  report: InstitutionalReadinessReport;
};

export function ReadinessScoreCard({ report }: ReadinessScoreCardProps) {
  const healthyCount = report.sections.filter((section) => section.status === "healthy").length;
  const partialCount = report.sections.filter((section) => section.status === "partial").length;
  const criticalCount = report.sections.filter((section) => section.status === "critical").length;

  return (
    <section className="readiness-score-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-score-card__head">
        <h3>Overall readiness</h3>
        <p>Aggregated from institutional audits 1–5 and live admin engines.</p>
      </header>

      <div className="readiness-score-card__hero">
        <strong>{report.overallScore}</strong>
        <span>/100</span>
      </div>

      <div className="readiness-score-card__metrics">
        <Metric label="Healthy sections" value={String(healthyCount)} tone="healthy" />
        <Metric label="Partial sections" value={String(partialCount)} tone="partial" />
        <Metric label="Critical sections" value={String(criticalCount)} tone="critical" />
        <Metric label="Critical blockers" value={String(report.criticalBlockers.length)} tone="blocker" />
        <Metric label="High risks" value={String(report.highRisks.length)} tone="high" />
        <Metric label="Medium risks" value={String(report.mediumRisks.length)} tone="medium" />
        <Metric label="Resolved risks" value={String(report.resolvedRisks.length)} tone="resolved" />
      </div>

      <footer className="readiness-score-card__foot">
        <p>Report generated {new Date(report.generatedAt).toLocaleString()}</p>
        <p>
          Section status key: {Object.values(HEALTH_STATUS_LABELS).join(" · ")}
        </p>
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
  tone: "healthy" | "partial" | "critical" | "blocker" | "high" | "medium" | "resolved";
}) {
  return (
    <article className={`readiness-score-metric readiness-score-metric--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
