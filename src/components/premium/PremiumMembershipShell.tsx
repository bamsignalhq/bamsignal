import { ArrowLeft, Check, Star } from "lucide-react";
import type { ReactNode } from "react";
import { DISCOVER_MEMBERSHIP_INCLUDES_TITLE } from "../../constants/commercialExperience";
import type { PremiumPlan } from "../../constants/plans";
import { SIGNAL_PASS_INCLUDES, planBadge, planCheckoutLabel } from "../../constants/plans";

type PremiumMembershipShellProps = {
  title?: string;
  subtitle?: string;
  onBack: () => void;
  children?: ReactNode;
};

/** Shared Discover Membership page header (overlay + /subscription). */
export function PremiumMembershipHead({
  title = "Discover Membership",
  subtitle,
  onBack,
  children
}: PremiumMembershipShellProps) {
  return (
    <header className="premium-page__head premium-page__head--fintech">
      <button type="button" className="icon-btn" onClick={onBack} aria-label="Back">
        <ArrowLeft size={22} />
      </button>
      <div>
        <h1 className="premium-page__title premium-page__title-row">
          {title}{" "}
          <Star size={20} className="premium-page__star" aria-hidden fill="currentColor" />
        </h1>
        {subtitle ? <p className="premium-page__subtitle">{subtitle}</p> : null}
        {children}
      </div>
    </header>
  );
}

type PremiumPlanButtonListProps = {
  plans: PremiumPlan[];
  onSelectPlan: (plan: PremiumPlan) => void;
  loading?: boolean;
  /** Optional per-plan muted line under price (Premium Center value copy). */
  planHint?: (plan: PremiumPlan) => string | undefined;
  ariaLabel?: string;
};

/** Shared plan CTA list — presentation only. */
export function PremiumPlanButtonList({
  plans,
  onSelectPlan,
  loading,
  planHint,
  ariaLabel = "Discover Membership plans"
}: PremiumPlanButtonListProps) {
  return (
    <section className="premium-plan-buttons" aria-label={ariaLabel}>
      {plans.map((plan) => {
        const badge = planBadge(plan);
        const hint = planHint?.(plan);
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
              {hint ? <span className="premium-center__muted">{hint}</span> : null}
            </span>
            {badge ? <span className="premium-plan-button__badge">{badge}</span> : null}
          </button>
        );
      })}
    </section>
  );
}

type PremiumIncludesListProps = {
  title?: string;
  items?: readonly string[];
};

export function PremiumIncludesList({
  title = DISCOVER_MEMBERSHIP_INCLUDES_TITLE,
  items = SIGNAL_PASS_INCLUDES
}: PremiumIncludesListProps) {
  return (
    <section className="premium-includes" aria-labelledby="premium-includes-title">
      <h2 id="premium-includes-title" className="premium-includes__title">
        {title}
      </h2>
      <ul className="premium-includes__list">
        {items.map((item) => (
          <li key={item}>
            <Check size={16} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
