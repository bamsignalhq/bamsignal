import { Flame } from "lucide-react";
import { quickiePriceLabel } from "../utils/quickie";

type QuickiePaywallModalProps = {
  open: boolean;
  onClose: () => void;
  onPay: () => void;
  loading?: boolean;
  context?: "intent" | "message";
};

export function QuickiePaywallModal({
  open,
  onClose,
  onPay,
  loading,
  context = "message"
}: QuickiePaywallModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Quickie daily pass">
      <div className="modal-card quickie-paywall">
        <div className="quickie-paywall__icon" aria-hidden>
          <Flame size={32} />
        </div>
        <h3>Quickie daily pass</h3>
        <p className="quickie-paywall__fine">
          {context === "intent"
            ? "Quickie profiles need an active daily pass to appear in discovery and receive messages."
            : "Message this member with a Quickie daily pass — one day of full access."}
        </p>
        <p className="quickie-paywall__price">{quickiePriceLabel()} / 24 hours</p>
        <button type="button" className="btn-primary btn-full" onClick={onPay} disabled={loading}>
          {loading ? "Opening Paystack…" : `Pay ${quickiePriceLabel()}`}
        </button>
        <button type="button" className="link-btn" onClick={onClose}>
          Not now
        </button>
      </div>
    </div>
  );
}
