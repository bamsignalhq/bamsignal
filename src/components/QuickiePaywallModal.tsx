import { X, Zap } from "lucide-react";
import { getQuickieUnlockProduct } from "../constants/quickie";

type QuickiePaywallModalProps = {
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  loading?: boolean;
  matchName?: string;
};

export function QuickiePaywallModal({
  open,
  onClose,
  onUnlock,
  loading,
  matchName
}: QuickiePaywallModalProps) {
  const quickie = getQuickieUnlockProduct();

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="paywall-modal quickie-paywall"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickie-paywall-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="paywall-header">
          <span className="gradient-pill">
            <Zap size={14} /> Quickie
          </span>
          <h2 id="quickie-paywall-title">Unlock this chat</h2>
          <p>
            {matchName
              ? `You sent your first message to ${matchName}. Pay once to keep chatting in the Quickie pool.`
              : quickie.description}
          </p>
        </div>
        <button type="button" className="btn-primary btn-full" disabled={loading} onClick={onUnlock}>
          Pay {quickie.priceLabel} & continue
        </button>
        <p className="quickie-paywall__fine">Quickie matches are private and intent-matched only.</p>
      </div>
    </div>
  );
}
