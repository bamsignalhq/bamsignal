import { X } from "lucide-react";
import { MONETIZATION_COPY } from "../../constants/copy";
import { trackEvent } from "../../utils/analytics";
import { trackUpgradeClick, trackUpgradeImpression } from "../../utils/premiumConversion";
import { useEffect } from "react";

type SignalLimitModalProps = {
  open: boolean;
  onClose: () => void;
  onGetSignalPass: () => void;
  loading?: boolean;
};

export function SignalLimitModal({ open, onClose, onGetSignalPass, loading }: SignalLimitModalProps) {
  useEffect(() => {
    if (open) {
      trackEvent("paywall_seen", { source: "signal_limit" });
      trackUpgradeImpression("signal_limit");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={loading ? undefined : onClose}>
      <div
        className="signal-limit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="signal-limit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
          <X size={20} />
        </button>
        <h2 id="signal-limit-title" className="signal-limit-modal__title">
          {MONETIZATION_COPY.signalsExhaustedTitle}
        </h2>
        <p className="signal-limit-modal__body">{MONETIZATION_COPY.signalsExhaustedHint}</p>
        <div className="signal-limit-modal__actions">
          <button type="button" className="btn-secondary btn-full" onClick={onClose} disabled={loading}>
            Maybe later
          </button>
          <button
            type="button"
            className="btn-primary btn-full"
            disabled={loading}
            onClick={() => {
              trackUpgradeClick("signal_limit");
              onGetSignalPass();
            }}
          >
            {loading ? MONETIZATION_COPY.checkoutLoading : MONETIZATION_COPY.getSignalPass}
          </button>
        </div>
      </div>
    </div>
  );
}
