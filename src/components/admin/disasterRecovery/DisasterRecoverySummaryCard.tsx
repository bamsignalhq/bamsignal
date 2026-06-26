import type { DisasterRecoverySummary } from "../../../types/disasterRecovery";

type DisasterRecoverySummaryCardProps = {
  summary: DisasterRecoverySummary;
};

export function DisasterRecoverySummaryCard({ summary }: DisasterRecoverySummaryCardProps) {
  return (
    <section className="disaster-recovery-summary concierge-consultant-card--glass cc-reveal">
      <header className="disaster-recovery-summary__head">
        <div>
          <h3>Backup health</h3>
          <p>Operational playbook status — last checked {new Date(summary.lastCheckedAt).toLocaleString()}</p>
        </div>
      </header>
      <div className="disaster-recovery-summary__grid">
        <div className="disaster-recovery-summary__stat">
          <strong>{summary.healthyMonitors}</strong>
          <span>Healthy</span>
        </div>
        <div className="disaster-recovery-summary__stat disaster-recovery-summary__stat--warn">
          <strong>{summary.warningMonitors}</strong>
          <span>Warning</span>
        </div>
        <div className="disaster-recovery-summary__stat disaster-recovery-summary__stat--alert">
          <strong>{summary.failedMonitors}</strong>
          <span>Failed</span>
        </div>
      </div>
    </section>
  );
}
