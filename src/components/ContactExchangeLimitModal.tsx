import type { PremiumPlan } from "../constants/plans";

type ContactExchangeLimitModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgrade: (plan: PremiumPlan) => void;
  plans: PremiumPlan[];
  message?: string;
};

export function ContactExchangeLimitModal({
  open,
  onClose,
  onUpgrade,
  plans,
  message
}: ContactExchangeLimitModalProps) {
  if (!open) return null;

  const recommended = plans.find((plan) => plan.highlight) || plans[0];

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="safety-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>Contact exchange limit reached</h3>
        <p className="safety-modal__lead">
          {message || "You've used your free contact exchange for this month."}
        </p>
        <p className="safety-modal__lead">Signal Pass lets you continue connecting without limits.</p>
        <div className="safety-modal__actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Maybe later
          </button>
          {recommended ? (
            <button type="button" className="btn-primary" onClick={() => onUpgrade(recommended)}>
              Get Signal Pass
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
