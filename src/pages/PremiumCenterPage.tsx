import { ArrowLeft, Check, Star } from "lucide-react";
import { useMemo } from "react";
import { BRAND, MONETIZATION_COPY } from "../constants/copy";
import {
  PREMIUM_EXPERIENCE_MISSION,
  PREMIUM_FEATURE_AUDIT,
  PREMIUM_VALUE_VS_PRICE,
} from "../constants/premiumExperience";
import type { PlanId, PremiumPlan } from "../constants/plans";
import { planBadge, planCheckoutLabel } from "../constants/plans";
import { PremiumPurchaseHistory } from "../components/premium/PremiumPurchaseHistory";
import { getSignalPassSnapshot } from "../services/premiumStatus";
import { listPremiumPurchaseHistory } from "../utils/premiumPurchaseHistory";
import {
  premiumRenewalMessage,
  remainingPremiumTimeLabel,
  resolvePremiumRenewalStage,
} from "../utils/premiumRenewal";
import { getPremiumUsageSnapshot } from "../utils/premiumUsage";
import { formatEntitlementUntil } from "../utils/memberEntitlements";

type PremiumCenterPageProps = {
  isPremium: boolean;
  plans: PremiumPlan[];
  onBack: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
  loading?: boolean;
};

const FEATURED_PLAN_ORDER: PlanId[] = ["monthly", "quarterly", "weekly"];

export function PremiumCenterPage({
  isPremium,
  plans,
  onBack,
  onSelectPlan,
  loading,
}: PremiumCenterPageProps) {
  const pass = getSignalPassSnapshot();
  const usage = useMemo(() => getPremiumUsageSnapshot(), [isPremium]);
  const history = useMemo(() => listPremiumPurchaseHistory(), [isPremium]);
  const renewalStage = resolvePremiumRenewalStage(pass.expiresAt);
  const renewalCopy = premiumRenewalMessage(renewalStage);

  const orderedPlans = useMemo(() => {
    const byId = new Map(plans.map((plan) => [plan.id, plan]));
    return FEATURED_PLAN_ORDER.map((id) => byId.get(id)).filter(
      (plan): plan is PremiumPlan => Boolean(plan),
    );
  }, [plans]);

  return (
    <div className="page premium-page premium-page--fintech premium-center">
      <header className="premium-page__head premium-page__head--fintech">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="premium-page__title premium-page__title-row">
            Signal Pass <Star size={20} className="premium-page__star" aria-hidden fill="currentColor" />
          </h1>
          <p className="premium-page__subtitle">{PREMIUM_EXPERIENCE_MISSION}</p>
        </div>
      </header>

      {isPremium ? (
        <section className="premium-center__status card">
          <p className="premium-center__eyebrow">Active · Premium Center</p>
          <p className="premium-center__remaining">
            {remainingPremiumTimeLabel(pass.expiresAt)}
          </p>
          {pass.expiresAt ? (
            <p className="premium-center__muted">
              Renews until {formatEntitlementUntil(pass.expiresAt)}
            </p>
          ) : null}
          {renewalCopy ? <p className="premium-center__renewal">{renewalCopy}</p> : null}
        </section>
      ) : (
        <section className="premium-center__status card">
          <p className="premium-center__eyebrow">Signal Pass</p>
          <p className="premium-center__muted">{BRAND.paywallBody}</p>
        </section>
      )}

      <section className="premium-center__section card" aria-labelledby="premium-benefits-title">
        <h2 id="premium-benefits-title" className="premium-center__section-title">
          Benefits
        </h2>
        <ul className="premium-center__benefits">
          {PREMIUM_FEATURE_AUDIT.map((feature) => (
            <li key={feature.id}>
              <Check size={16} aria-hidden />
              <div>
                <strong>{feature.label}</strong>
                <p className="premium-center__muted">{feature.summary}</p>
                <p className="premium-center__value">{feature.valueNote}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {isPremium ? (
        <section className="premium-center__section card" aria-labelledby="premium-usage-title">
          <h2 id="premium-usage-title" className="premium-center__section-title">
            Usage
          </h2>
          <div className="premium-center__usage-grid">
            <div>
              <p className="premium-center__muted">Signals today</p>
              <p className="premium-center__stat">
                {usage.signalsUsedToday} · {usage.signalsLimitLabel}
              </p>
            </div>
            <div>
              <p className="premium-center__muted">Messages today</p>
              <p className="premium-center__stat">
                {usage.messagesUsedToday} · {usage.messagesLimitLabel}
              </p>
            </div>
            <div>
              <p className="premium-center__muted">Profile views</p>
              <p className="premium-center__stat">
                {usage.profileViewsTotal} total · {usage.profileViewsToday} today
              </p>
            </div>
            <div>
              <p className="premium-center__muted">Advanced filters</p>
              <p className="premium-center__stat">{usage.advancedFilterCount} active</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="premium-center__section card" aria-labelledby="premium-renewal-title">
        <h2 id="premium-renewal-title" className="premium-center__section-title">
          {isPremium ? "Renewal" : "Choose a plan"}
        </h2>
        {!isPremium ? (
          <p className="premium-center__muted">
            Value exceeds price — from {PREMIUM_VALUE_VS_PRICE.monthly.perDay} on Monthly.
          </p>
        ) : null}
        <div className="premium-plan-buttons" aria-label="Signal Pass plans">
          {orderedPlans.map((plan) => {
            const badge = planBadge(plan);
            const value = PREMIUM_VALUE_VS_PRICE[plan.id];
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
                  <span className="premium-center__muted">{value.headline}</span>
                </span>
                {badge ? <span className="premium-plan-button__badge">{badge}</span> : null}
              </button>
            );
          })}
        </div>
        {loading ? (
          <p className="premium-page__checkout-status" role="status">
            {MONETIZATION_COPY.checkoutLoading}
          </p>
        ) : null}
      </section>

      <section className="premium-center__section card" aria-labelledby="premium-history-title">
        <h2 id="premium-history-title" className="premium-center__section-title">
          History
        </h2>
        <PremiumPurchaseHistory purchases={history} />
      </section>
    </div>
  );
}
