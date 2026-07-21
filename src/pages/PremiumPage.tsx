import { useMemo } from "react";
import { BRAND, MONETIZATION_COPY } from "../constants/copy";
import type { PlanId, PremiumPlan } from "../constants/plans";
import {
  PremiumIncludesList,
  PremiumMembershipHead,
  PremiumPlanButtonList
} from "../components/premium/PremiumMembershipShell";
import { MemberLoadingState } from "../components/member";

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
      <PremiumMembershipHead
        onBack={onBack}
        subtitle={!isPremium ? BRAND.paywallBody : undefined}
      />

      {isPremium ? (
        <section className="premium-page__active premium-page__active--fintech">
          <p className="premium-page__active-label">Active</p>
          <p className="premium-page__active-copy">Discover Membership is on your account.</p>
        </section>
      ) : (
        <>
          <PremiumPlanButtonList
            plans={orderedPlans}
            onSelectPlan={onSelectPlan}
            loading={loading}
          />
          <PremiumIncludesList />
          {loading ? (
            <MemberLoadingState label={MONETIZATION_COPY.checkoutLoading} compact />
          ) : null}
        </>
      )}
    </div>
  );
}
