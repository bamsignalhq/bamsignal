import { ArrowLeft, Check } from "lucide-react";
import { useMemo, useState } from "react";
import type { PlanId, PremiumPlan } from "../constants/plans";
import { SIGNAL_PASS_INCLUDES, durationLabel, planBadge, planShortLabel } from "../constants/plans";

type PremiumPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onBack: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
  loading?: boolean;
};

function defaultPlanId(plans: PremiumPlan[]): PlanId {
  return plans.find((p) => p.id === "monthly")?.id ?? plans[0]?.id ?? "monthly";
}

export function PremiumPage({ isPremium, plans, onBack, onSelectPlan, loading }: PremiumPageProps) {
  const [selectedId, setSelectedId] = useState<PlanId>(() => defaultPlanId(plans));
  const selected = useMemo(
    () => plans.find((p) => p.id === selectedId) ?? plans[0],
    [plans, selectedId]
  );

  return (
    <div className="page premium-page premium-page--fintech">
      <header className="premium-page__head premium-page__head--fintech">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="premium-page__title">Signal Pass</h1>
          {!isPremium && <p className="premium-page__subtitle">Choose a plan</p>}
        </div>
      </header>

      {isPremium ? (
        <section className="premium-page__active premium-page__active--fintech">
          <p className="premium-page__active-label">Active</p>
          <p className="premium-page__active-copy">Signal Pass is on your account.</p>
        </section>
      ) : (
        <>
          <section className="premium-plan-strip" aria-label="Signal Pass plans">
            {plans.map((plan) => {
              const active = plan.id === selectedId;
              const badge = planBadge(plan);
              return (
                <button
                  key={plan.id}
                  type="button"
                  className={`premium-plan-strip__card${active ? " premium-plan-strip__card--selected" : ""}`}
                  onClick={() => setSelectedId(plan.id)}
                  aria-pressed={active}
                >
                  <div className="premium-plan-strip__main">
                    <span className="premium-plan-strip__name">{planShortLabel(plan)}</span>
                    <span className="premium-plan-strip__duration">{durationLabel(plan.days)}</span>
                  </div>
                  <div className="premium-plan-strip__aside">
                    {badge ? <span className="premium-plan-strip__badge">{badge}</span> : null}
                    <span className="premium-plan-strip__price">{plan.priceLabel}</span>
                  </div>
                </button>
              );
            })}
          </section>

          <section className="premium-includes" aria-labelledby="premium-includes-title">
            <h2 id="premium-includes-title" className="premium-includes__title">
              Included with Signal Pass
            </h2>
            <ul className="premium-includes__list">
              {SIGNAL_PASS_INCLUDES.map((item) => (
                <li key={item}>
                  <Check size={16} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <button
            type="button"
            className="btn-primary btn-full premium-page__upgrade"
            disabled={loading || !selected}
            onClick={() => selected && onSelectPlan(selected)}
          >
            {loading ? "Opening checkout…" : "Upgrade Now"}
          </button>
        </>
      )}
    </div>
  );
}
