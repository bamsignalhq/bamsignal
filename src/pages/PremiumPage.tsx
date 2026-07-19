import { ArrowLeft, Check, Star } from "lucide-react";
import { useMemo } from "react";
import { BRAND, MONETIZATION_COPY } from "../constants/copy";
import { DISCOVER_MEMBERSHIP_INCLUDES_TITLE } from "../constants/commercialExperience";
import type { PlanId, PremiumPlan } from "../constants/plans";
import { SIGNAL_PASS_INCLUDES, planBadge, planCheckoutLabel } from "../constants/plans";

type PremiumPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onBack: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
  loading?: boolean;
};

const FEATURED_PLAN_ORDER: PlanId[] = ["monthly", "quarterly", "weekly"];

export function PremiumPage({ isPremium, plans, onBack, onSelectPlan, loading }: PremiumPageProps) {
  const orderedPlans = useMemo(() => {
    const byId = new Map(plans.map((plan) => [plan.id, plan]));
    const featured = FEATURED_PLAN_ORDER.map((id) => byId.get(id)).filter(
      (plan): plan is PremiumPlan => Boolean(plan)
    );
    return featured.length ? featured : plans;
  }, [plans]);

  return (
    <div className="page premium-page premium-page--fintech">
      <header className="premium-page__head premium-page__head--fintech">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="premium-page__title premium-page__title-row">
            Discover Membership{" "}
            <Star size={20} className="premium-page__star" aria-hidden fill="currentColor" />
          </h1>
          {!isPremium && <p className="premium-page__subtitle">{BRAND.paywallBody}</p>}
        </div>
      </header>

      {isPremium ? (
        <section className="premium-page__active premium-page__active--fintech">
          <p className="premium-page__active-label">Active</p>
          <p className="premium-page__active-copy">Discover Membership is on your account.</p>
        </section>
      ) : (
        <>
          <section className="premium-plan-buttons" aria-label="Discover Membership plans">
            {orderedPlans.map((plan) => {
              const badge = planBadge(plan);
              return (
                <button
                  key={plan.id}
                  type="button"
                  className="premium-plan-button"
                  disabled={loading}
                  onClick={() => onSelectPlan(plan)}
                >
                  <span>
                    <span className="premium-plan-button__name">{planCheckoutLabel(plan)}</span>
                    <span className="premium-plan-button__price">{plan.priceLabel}</span>
                  </span>
                  {badge ? <span className="premium-plan-button__badge">{badge}</span> : null}
                </button>
              );
            })}
          </section>

          <section className="premium-includes" aria-labelledby="premium-includes-title">
            <h2 id="premium-includes-title" className="premium-includes__title">
              {DISCOVER_MEMBERSHIP_INCLUDES_TITLE}
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

          {loading ? (
            <p className="premium-page__checkout-status" role="status">
              {MONETIZATION_COPY.checkoutLoading}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
