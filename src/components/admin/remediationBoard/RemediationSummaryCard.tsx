import type { RemediationBoardMetrics } from "../../../types/remediationBoard";

type RemediationSummaryCardProps = {
  metrics: RemediationBoardMetrics;
  generatedAt: string;
};

export function RemediationSummaryCard({ metrics, generatedAt }: RemediationSummaryCardProps) {
  return (
    <section className="remediation-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="remediation-summary-card__head">
        <h3>Remediation summary</h3>
        <p>Centralized findings from institutional audits 1–5.</p>
      </header>

      <div className="remediation-summary-card__metrics">
        <Metric label="Open findings" value={String(metrics.openFindings)} tone="open" />
        <Metric label="Critical findings" value={String(metrics.criticalFindings)} tone="critical" />
        <Metric label="Resolved findings" value={String(metrics.resolvedFindings)} tone="resolved" />
        <Metric label="Launch blockers" value={String(metrics.launchBlockers)} tone="blocker" />
      </div>

      <footer className="remediation-summary-card__foot">
        <p>Total tracked: {metrics.totalFindings}</p>
        <p>Generated: {new Date(generatedAt).toLocaleString()}</p>
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
  tone: "open" | "critical" | "resolved" | "blocker";
}) {
  return (
    <article className={`remediation-metric-chip remediation-metric-chip--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
