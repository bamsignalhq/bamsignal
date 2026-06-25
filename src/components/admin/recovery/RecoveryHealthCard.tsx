import type { RecoveryHealthSummary } from "../../../types/recoveryCenter";
import { formatRecoverySummaryLine } from "../../../utils/recoveryCenterLogic";

type RecoveryHealthCardProps = {
  summary: RecoveryHealthSummary;
};

export function RecoveryHealthCard({ summary }: RecoveryHealthCardProps) {
  return (
    <section className="recovery-card recovery-health-card concierge-consultant-card--glass cc-reveal">
      <header className="recovery-card__head">
        <h3>Recovery health</h3>
        <p>Institutional resilience posture — assume failures will happen; design to survive them.</p>
      </header>
      <div className="recovery-health-card__score">
        <span>Readiness</span>
        <strong>{summary.score}%</strong>
        <span className="recovery-health-card__label">{summary.label}</span>
      </div>
      <p className="recovery-card__line">{formatRecoverySummaryLine(summary)}</p>
      <div className="recovery-card__grid">
        <article>
          <span>Healthy backups</span>
          <strong>
            {summary.healthyBackups}/{summary.totalBackups}
          </strong>
        </article>
        <article>
          <span>Playbooks ready</span>
          <strong>{summary.testedPlaybooks}</strong>
        </article>
        <article>
          <span>Active restores</span>
          <strong>{summary.activeRestores}</strong>
        </article>
        <article>
          <span>Verified restores</span>
          <strong>{summary.verifiedRestores}</strong>
        </article>
      </div>
    </section>
  );
}
