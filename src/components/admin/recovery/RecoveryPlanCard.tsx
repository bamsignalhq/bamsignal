import {
  RECOVERY_LEVEL_LABELS,
  RECOVERY_PLAN_STATUS_LABELS,
  type RecoveryLevelId
} from "../../../constants/recoveryCenter";
import type { RecoveryPlanRecord } from "../../../types/recoveryCenter";

type RecoveryPlanCardProps = {
  plan: RecoveryPlanRecord;
  hint: string;
};

export function RecoveryPlanCard({ plan, hint }: RecoveryPlanCardProps) {
  return (
    <article className="recovery-plan-card concierge-consultant-card--glass">
      <header className="recovery-plan-card__head">
        <div>
          <span className="recovery-plan-card__eyebrow">
            {RECOVERY_LEVEL_LABELS[plan.levelId as RecoveryLevelId]}
          </span>
          <h3>{plan.title}</h3>
        </div>
        <span className={`recovery-plan-card__status recovery-plan-card__status--${plan.status}`}>
          {RECOVERY_PLAN_STATUS_LABELS[plan.status]}
        </span>
      </header>
      <p>{hint}</p>
      <dl className="recovery-plan-card__grid">
        <div>
          <dt>Owner</dt>
          <dd>{plan.owner}</dd>
        </div>
        <div>
          <dt>RTO</dt>
          <dd>{plan.rtoMinutes} min</dd>
        </div>
        <div>
          <dt>RPO</dt>
          <dd>{plan.rpoMinutes} min</dd>
        </div>
        <div>
          <dt>Last tested</dt>
          <dd>{plan.lastTestedAt ? new Date(plan.lastTestedAt).toLocaleString() : "Not tested"}</dd>
        </div>
      </dl>
      <ol className="recovery-plan-card__steps">
        {plan.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}
