import { READINESS_RESULT_LABELS } from "../../../constants/institutionalReadiness";
import type { InstitutionalReadinessVerificationBundle } from "../../../types/institutionalReadiness";
import { formatReadinessSummaryLine } from "../../../utils/institutionalReadinessLogic";

type ReadinessOverviewCardProps = {
  bundle: InstitutionalReadinessVerificationBundle;
};

export function ReadinessOverviewCard({ bundle }: ReadinessOverviewCardProps) {
  const healthyCount = bundle.subsystems.filter((item) => item.status === "healthy").length;
  const warningCount = bundle.subsystems.filter((item) => item.status === "warning").length;
  const criticalCount = bundle.subsystems.filter((item) => item.status === "critical").length;
  const unknownCount = bundle.subsystems.filter((item) => item.status === "unknown").length;

  return (
    <section className="readiness-verification-card readiness-overview-card concierge-consultant-card--glass cc-reveal">
      <header className="readiness-verification-card__head">
        <h3>Institutional readiness score</h3>
        <p>Overall platform score with trend — evaluates every audit domain in one place.</p>
      </header>

      <div className="readiness-overview-card__hero">
        <strong>{bundle.institutionReadinessScore}</strong>
        <span>/100</span>
        <span
          className={`readiness-overview-card__trend readiness-overview-card__trend--${bundle.trend.direction}`}
        >
          {bundle.trend.direction === "up"
            ? "↑"
            : bundle.trend.direction === "down"
              ? "↓"
              : "—"}{" "}
          {bundle.trend.deltaPercent}%
        </span>
      </div>

      <p className="readiness-verification-card__line">{formatReadinessSummaryLine(bundle)}</p>

      <div className="readiness-overview-card__metrics">
        <Metric label="Healthy" value={String(healthyCount)} tone="healthy" />
        <Metric label="Warning" value={String(warningCount)} tone="warning" />
        <Metric label="Critical" value={String(criticalCount)} tone="critical" />
        <Metric label="Unknown" value={String(unknownCount)} tone="unknown" />
        <Metric label="Passed checks" value={String(bundle.passedChecks.length)} tone="passed" />
        <Metric label="Critical issues" value={String(bundle.criticalIssues.length)} tone="blocker" />
        <Metric label="Warnings" value={String(bundle.warnings.length)} tone="high" />
      </div>

      <footer className="readiness-verification-card__foot">
        <p>Verified {new Date(bundle.generatedAt).toLocaleString()}</p>
        <p>Status key: {Object.values(READINESS_RESULT_LABELS).join(" · ")}</p>
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
  tone: "healthy" | "warning" | "critical" | "unknown" | "passed" | "blocker" | "high";
}) {
  return (
    <article className={`readiness-overview-metric readiness-overview-metric--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
