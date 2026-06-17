import { Zap } from "lucide-react";
import { quickiePassDays, quickiePriceLabel } from "../utils/quickie";
import { durationLabel } from "../constants/plans";

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

  const passDays = quickiePassDays();
  const price = quickiePriceLabel();

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Fast Connection Pass">
      <div className="modal-card quickie-paywall">
        <div className="quickie-paywall__icon" aria-hidden>
          <Zap size={32} />
        </div>
        <h3>Fast Connection Pass</h3>
        <p className="quickie-paywall__fine">
          {context === "intent"
            ? "Fast Connection members need an active pass to appear in discovery and receive messages."
            : "Message this member with a Fast Connection Pass — faster-paced connections, on your terms."}
        </p>
        <p className="quickie-paywall__price">
          {price} / {durationLabel(passDays)}
        </p>
        <button type="button" className="btn-primary btn-full" onClick={onPay} disabled={loading}>
          {loading ? "Opening Paystack…" : `Pay ${price}`}
        </button>
        <button type="button" className="link-btn" onClick={onClose}>
          Not now
        </button>
      </div>
    </div>
  );
}
