import { useEffect } from "react";
import { X } from "lucide-react";
import { BRAND } from "../constants/copy";
import type { PremiumPlan } from "../constants/plans";
import { PlanCard } from "./PlanCard";
import { trackEvent } from "../utils/analytics";

type PaywallModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PremiumPlan) => void;
  plans: PremiumPlan[];
  loading?: boolean;
};

export function PaywallModal({ open, onClose, onSelectPlan, plans, loading }: PaywallModalProps) {
  useEffect(() => {
    if (open) trackEvent("paywall_seen", { source: "paywall_modal" });
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="paywall-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="paywall-header">
          <span className="gradient-pill">Premium</span>
          <h2 id="paywall-title">{BRAND.paywallTitle}</h2>
          {BRAND.paywallBody ? <p>{BRAND.paywallBody}</p> : null}
        </div>
        <div className="plan-grid">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => onSelectPlan(plan)}
              disabled={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
