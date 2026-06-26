import type { SecurityOpsScore } from "../../../types/securityOperationsCenter";
import { SECURITY_OPS_HEALTH_LABELS } from "../../../constants/securityOperationsCenter";

type SecurityOpsScoresCardProps = {
  scores: SecurityOpsScore[];
};

export function SecurityOpsScoresCard({ scores }: SecurityOpsScoresCardProps) {
  return (
    <section className="security-ops-card security-ops-scores-card concierge-consultant-card--glass cc-reveal">
      <header className="security-ops-card__head">
        <h3>Security score</h3>
        <p>Authentication, authorization, infrastructure, payments, notifications, storage, database.</p>
      </header>
      <div className="security-ops-scores-card__grid">
        {scores.map((score) => (
          <article key={score.id} className={`security-ops-score security-ops-score--${score.status}`}>
            <span>{score.label}</span>
            <strong>{score.score}%</strong>
            <em>{SECURITY_OPS_HEALTH_LABELS[score.status]}</em>
          </article>
        ))}
      </div>
    </section>
  );
}
