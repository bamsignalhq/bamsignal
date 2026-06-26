import type { DisasterPlanRecord } from "../../../types/disasterRecovery";

type DisasterPlansCardProps = {
  plans: DisasterPlanRecord[];
};

export function DisasterPlansCard({ plans }: DisasterPlansCardProps) {
  return (
    <section className="disaster-plans-card concierge-consultant-card--glass cc-reveal">
      <header>
        <h3>Disaster plans</h3>
        <p>
          Database failure, storage outage, provider outage, payment outage, notification outage,
          and complete platform outage.
        </p>
      </header>
      <div className="disaster-plans-card__list">
        {plans.map((plan) => (
          <article key={plan.id} className="disaster-plan-row">
            <div className="disaster-plan-row__head">
              <strong>{plan.label}</strong>
              <span className={`disaster-plan-row__status disaster-plan-row__status--${plan.status}`}>
                {plan.status}
              </span>
            </div>
            <p className="disaster-plan-row__owner">
              Owner: {plan.owner} · RTO {plan.rtoMinutes}m · RPO {plan.rpoMinutes}m
            </p>
            <ol className="disaster-plan-row__steps">
              {plan.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
            {plan.lastTestedAt ? (
              <p className="disaster-plan-row__tested">
                Last tested {new Date(plan.lastTestedAt).toLocaleString()}
              </p>
            ) : (
              <p className="disaster-plan-row__tested">Not yet tested</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
