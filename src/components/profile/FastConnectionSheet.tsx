import { Loader2, X, Zap } from "lucide-react";
import { quickiePassDays, quickiePriceLabel } from "../../utils/quickie";

type FastConnectionSheetProps = {
  open: boolean;
  onClose: () => void;
  onContinuePayment: () => void;
  loading?: boolean;
};

export function FastConnectionSheet({
  open,
  onClose,
  onContinuePayment,
  loading
}: FastConnectionSheetProps) {
  if (!open) return null;

  const passDays = quickiePassDays();
  const price = quickiePriceLabel();

  return (
    <div
      className="profile-boost-sheet fast-connection-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fast-connection-sheet-title"
    >
      <button
        type="button"
        className="profile-boost-sheet__backdrop"
        onClick={loading ? undefined : onClose}
        aria-label="Close"
      />
      <div className="profile-boost-sheet__panel fast-connection-sheet__panel">
        <header className="profile-boost-sheet__head">
          <div className="fast-connection-sheet__intro">
            <div className="fast-connection-sheet__icon" aria-hidden>
              <Zap size={24} />
            </div>
            <div>
              <h2 id="fast-connection-sheet-title">Fast Connection</h2>
              <p className="profile-boost-sheet__subtitle">
                Get highlighted for faster conversations for {passDays} days.
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={loading}>
            <X size={20} />
          </button>
        </header>

        <p className="fast-connection-sheet__price">{price}</p>

        <div className="fast-connection-sheet__actions">
          <button type="button" className="btn-secondary btn-full" onClick={onClose} disabled={loading}>
            Maybe later
          </button>
          <button
            type="button"
            className="btn-primary btn-full"
            onClick={onContinuePayment}
            disabled={loading}
          >
            {loading ? <Loader2 className="spin" size={20} /> : "Continue to payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
