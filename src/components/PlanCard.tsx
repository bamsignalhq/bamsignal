import type { PremiumPlan } from "../constants/plans";

type PlanCardProps = {
  plan: PremiumPlan;
  onSelect: () => void;
  disabled?: boolean;
  compact?: boolean;
};

export function PlanCard({ plan, onSelect, disabled, compact }: PlanCardProps) {
  return (
    <button
      type="button"
      className={`plan-card ${compact ? "compact" : ""}`}
      onClick={onSelect}
      disabled={disabled}
    >
      <strong>{plan.name}</strong>
      <span className="plan-price">{plan.priceLabel}</span>
      {!compact && <span className="plan-cta">Upgrade</span>}
    </button>
  );
}
