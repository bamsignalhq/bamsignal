import { X } from "lucide-react";

type FastConnectionLimitModalProps = {
  open: boolean;
  onClose: () => void;
  onUpgradePremium: () => void;
  loading?: boolean;
};

export function FastConnectionLimitModal({
  open,
  onClose,
  onUpgradePremium,
  loading
}: FastConnectionLimitModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={loading ? undefined : onClose}>
      <div
        className="signal-limit-modal fast-connection-limit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fast-connection-limit-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
          <X size={20} />
        </button>
        <h2 id="fast-connection-limit-title" className="signal-limit-modal__title">
          You&apos;ve used today&apos;s Fast Signals.
        </h2>
        <p className="signal-limit-modal__body">More Fast Signals will be available tomorrow.</p>
        <p className="signal-limit-modal__body">Need unlimited signals?</p>
        <p className="signal-limit-modal__body">Upgrade to Premium.</p>
        <div className="signal-limit-modal__actions">
          <button type="button" className="btn-secondary btn-full" onClick={onClose} disabled={loading}>
            Maybe later
          </button>
          <button type="button" className="btn-primary btn-full" onClick={onUpgradePremium} disabled={loading}>
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
