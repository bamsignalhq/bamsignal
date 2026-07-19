import { useEffect } from "react";
import { Check, X } from "lucide-react";
import type { PremiumPlan } from "../constants/plans";
import { SIGNAL_PASS_INCLUDES, durationLabel, planBadge, planCheckoutLabel } from "../constants/plans";
import { BRAND, MONETIZATION_COPY } from "../constants/copy";
import { trackEvent } from "../utils/analytics";
import { trackUpgradeClick, trackUpgradeImpression } from "../utils/premiumConversion";

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
  plans: PremiumPlan[];
  loading?: boolean;
};

export function PaywallModal({ open, onClose, onSelectPlan, plans, loading }: PaywallModalProps) {
  useEffect(() => {
    if (open) {
      trackEvent("paywall_seen", { source: "paywall_modal" });
      trackUpgradeImpression("paywall_modal");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={loading ? undefined : onClose}>
      <div
        className="paywall-modal paywall-modal--fintech"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
          <X size={20} />
        </button>

        <h2 id="paywall-title" className="paywall-modal__title">
          {BRAND.paywallTitle}
        </h2>
        <p className="paywall-modal__subtitle">{BRAND.paywallBody}</p>

        <div className="premium-plan-strip premium-plan-strip--modal" aria-label="Discover Membership plans">
          {plans.map((plan) => {
            const badge = planBadge(plan);
            return (
              <button
                key={plan.id}
                type="button"
                className="premium-plan-strip__card premium-plan-strip__card--checkout"
                disabled={loading}
                onClick={() => {
                  trackUpgradeClick("paywall_modal");
                  onSelectPlan(plan);
                }}
              >
                <div className="premium-plan-strip__main">
                  <span className="premium-plan-strip__name">{planCheckoutLabel(plan)}</span>
                  <span className="premium-plan-strip__duration">{durationLabel(plan.days)}</span>
                </div>
                <div className="premium-plan-strip__aside">
                  {badge ? <span className="premium-plan-strip__badge">{badge}</span> : null}
                  <span className="premium-plan-strip__price">{plan.priceLabel}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="premium-includes premium-includes--modal">
          <p className="premium-includes__title">Included with Discover Membership</p>
          <ul className="premium-includes__list">
            {SIGNAL_PASS_INCLUDES.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {loading ? (
          <p className="paywall-modal__status" role="status">
            {MONETIZATION_COPY.checkoutLoading}
          </p>
        ) : null}
      </div>
    </div>
  );
}
