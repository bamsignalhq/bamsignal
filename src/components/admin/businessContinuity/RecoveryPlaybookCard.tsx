import { RECOVERY_PLAYBOOK_DOMAIN_LABELS } from "../../../constants/businessContinuity";
import type { RecoveryPlanRecord } from "../../../types/businessContinuity";

type RecoveryPlaybookCardProps = {
  plans: RecoveryPlanRecord[];
};

export function RecoveryPlaybookCard({ plans }: RecoveryPlaybookCardProps) {
  return (
    <section className="continuity-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Recovery playbooks</h3>
        <p>Documented procedures for database, payment, email, WhatsApp, calendar, Zoom, auth, storage, server, and DNS outages.</p>
      </header>
      <ul className="continuity-playbook-list">
        {plans.map((plan) => (
          <li key={plan.id} className="continuity-playbook">
            <div>
              <strong>{plan.title}</strong>
              <span>{RECOVERY_PLAYBOOK_DOMAIN_LABELS[plan.domainId]}</span>
            </div>
            <div className="continuity-playbook__meta">
              <span className={`continuity-pill continuity-pill--${plan.status === "ready" ? "healthy" : "degraded"}`}>
                {plan.status}
              </span>
              <span>{plan.procedureSteps.length} steps</span>
              {plan.lastTestedAt ? (
                <span>Tested {new Date(plan.lastTestedAt).toLocaleDateString()}</span>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
