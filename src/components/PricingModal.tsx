import { Crown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BoostShop } from "./BoostShop";
import type { BoostProduct } from "../constants/boosts";
import type { PremiumPlan } from "../constants/plans";
import { fetchBoostProducts } from "../services/boosts";

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
  plans: PremiumPlan[];
  onSelectPlan: (plan: PremiumPlan) => void;
  onPurchaseBoost?: (product: BoostProduct) => void;
  loading?: boolean;
};

export function PricingModal({
  open,
  onClose,
  plans,
  onSelectPlan,
  onPurchaseBoost,
  loading
}: PricingModalProps) {
  const [boosts, setBoosts] = useState<BoostProduct[]>([]);

  useEffect(() => {
    if (!open) return;
    void fetchBoostProducts().then(setBoosts);
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop pricing-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="pricing-modal pricing-modal--v6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="pricing-modal-head">
          <Crown size={22} />
          <h2 id="pricing-modal-title">Signal Pass</h2>
        </div>
        <div className="pricing-modal-list">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className="pricing-modal-row"
              onClick={() => onSelectPlan(plan)}
              disabled={loading}
            >
              <div className="pricing-modal-row__copy">
                <strong>{plan.name}</strong>
              </div>
              <div className="pricing-modal-price">{plan.priceLabel}</div>
            </button>
          ))}
        </div>

        {boosts.length > 0 && onPurchaseBoost && (
          <BoostShop products={boosts} onPurchase={onPurchaseBoost} loading={loading} />
        )}
      </div>
    </div>
  );
}
