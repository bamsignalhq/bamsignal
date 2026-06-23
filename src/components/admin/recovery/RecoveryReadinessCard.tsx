import type { RecoveryReadinessSummary } from "../../../types/recoveryCenter";

type RecoveryReadinessCardProps = {
  readiness: RecoveryReadinessSummary;
};

export function RecoveryReadinessCard({ readiness }: RecoveryReadinessCardProps) {
  return (
    <section className="recovery-readiness-card concierge-consultant-card--glass cc-reveal" aria-label="Recovery readiness">
      <header className="recovery-readiness-card__head">
        <div>
          <h3>Recovery readiness</h3>
          <p>Backup health, tested plans, and active incident posture.</p>
        </div>
        <div className="recovery-readiness-card__score">
          <strong>{readiness.score}%</strong>
          <span>{readiness.label}</span>
        </div>
      </header>

      <dl className="recovery-readiness-card__grid">
        <div>
          <dt>Healthy backups</dt>
          <dd>
            {readiness.healthyBackups} / {readiness.totalBackups}
          </dd>
        </div>
        <div>
          <dt>Tested plans</dt>
          <dd>
            {readiness.testedPlans} / {readiness.totalPlans}
          </dd>
        </div>
        <div>
          <dt>Active incidents</dt>
          <dd>{readiness.activeIncidents}</dd>
        </div>
      </dl>
    </section>
  );
}
