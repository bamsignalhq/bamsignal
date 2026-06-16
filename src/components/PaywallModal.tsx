import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import type { PlanId, PremiumPlan } from "../constants/plans";
import { SIGNAL_PASS_INCLUDES, durationLabel, planBadge, planShortLabel } from "../constants/plans";
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

function defaultPlanId(plans: PremiumPlan[]): PlanId {
  return plans.find((p) => p.id === "monthly")?.id ?? plans[0]?.id ?? "monthly";
}

export function PaywallModal({ open, onClose, onSelectPlan, plans, loading }: PaywallModalProps) {
  const [selectedId, setSelectedId] = useState<PlanId>(() => defaultPlanId(plans));
  const selected = useMemo(
    () => plans.find((p) => p.id === selectedId) ?? plans[0],
    [plans, selectedId]
  );

  useEffect(() => {
    if (open) {
      trackEvent("paywall_seen", { source: "paywall_modal" });
      trackUpgradeImpression("paywall_modal");
      setSelectedId(defaultPlanId(plans));
    }
  }, [open, plans]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="paywall-modal paywall-modal--fintech"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 id="paywall-title" className="paywall-modal__title">
          {BRAND.paywallTitle}
        </h2>
        <p className="paywall-modal__subtitle">{BRAND.paywallBody}</p>

        <div className="premium-plan-strip premium-plan-strip--modal" aria-label="Signal Pass plans">
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
        </div>

        <div className="premium-includes premium-includes--modal">
          <p className="premium-includes__title">Included with Signal Pass</p>
          <ul className="premium-includes__list">
            {SIGNAL_PASS_INCLUDES.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="btn-primary btn-full premium-page__upgrade"
          disabled={loading || !selected}
          onClick={() => {
            if (!selected) return;
            trackUpgradeClick("paywall_modal");
            onSelectPlan(selected);
          }}
        >
          {loading ? MONETIZATION_COPY.checkoutLoading : MONETIZATION_COPY.getSignalPass}
        </button>
      </div>
    </div>
  );
}
