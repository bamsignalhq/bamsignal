import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BoostShop } from "./BoostShop";
import type { BoostProduct } from "../constants/boosts";
import type { PremiumPlan } from "../constants/plans";
import { SIGNAL_PASS_INCLUDES, durationLabel, planBadge, planCheckoutLabel } from "../constants/plans";
import { BRAND, MONETIZATION_COPY } from "../constants/copy";
import { STORAGE_KEYS } from "../constants/limits";
import { fetchBoostProducts } from "../services/boosts";
import { normalizeDatingProfile } from "../utils/profile";
import { readJson } from "../utils/storage";

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
  plans: PremiumPlan[];
  onSelectPlan: (plan: PremiumPlan) => void;
  onPurchaseBoost?: (product: BoostProduct) => void;
  loading?: boolean;
  memberCity?: string;
};

export function PricingModal({
  open,
  onClose,
  plans,
  onSelectPlan,
  onPurchaseBoost,
  loading,
  memberCity: memberCityProp
}: PricingModalProps) {
  const [boosts, setBoosts] = useState<BoostProduct[]>([]);
  const [memberCity, setMemberCity] = useState("");

  useEffect(() => {
    if (!open) return;
    void fetchBoostProducts().then(setBoosts);
    const profile = normalizeDatingProfile(readJson(STORAGE_KEYS.datingProfile, {}));
    const user = readJson<{ city?: string }>(STORAGE_KEYS.userProfile, {});
    setMemberCity(memberCityProp?.trim() || profile.city?.trim() || user.city?.trim() || "");
  }, [open, memberCityProp]);

  if (!open) return null;

  return (
    <div className="modal-backdrop pricing-modal-backdrop" role="presentation" onClick={loading ? undefined : onClose}>
      <div
        className="pricing-modal pricing-modal--v6 pricing-modal--fintech"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <h2 id="pricing-modal-title" className="paywall-modal__title">
          {BRAND.paywallTitle}
        </h2>
        <p className="paywall-modal__subtitle">{BRAND.paywallBody}</p>

        <div className="premium-plan-strip premium-plan-strip--modal" aria-label="Signal Pass plans">
          {plans.map((plan) => {
            const badge = planBadge(plan);
            return (
              <button
                key={plan.id}
                type="button"
                className="premium-plan-strip__card premium-plan-strip__card--checkout"
                disabled={loading}
                onClick={() => onSelectPlan(plan)}
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

        {loading ? (
          <p className="paywall-modal__status" role="status">
            {MONETIZATION_COPY.checkoutLoading}
          </p>
        ) : null}

        {boosts.length > 0 && onPurchaseBoost && (
          <BoostShop
            products={boosts}
            onPurchase={onPurchaseBoost}
            loading={loading}
            memberCity={memberCity}
          />
        )}
      </div>
    </div>
  );
}
