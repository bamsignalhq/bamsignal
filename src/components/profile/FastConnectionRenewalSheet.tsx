import { Loader2, X, Zap } from "lucide-react";
import { quickiePassDays, quickiePriceLabel } from "../../utils/quickie";

type FastConnectionRenewalSheetProps = {
  open: boolean;
  onClose: () => void;
  onRenew: () => void;
  loading?: boolean;
};

export function FastConnectionRenewalSheet({
  open,
  onClose,
  onRenew,
  loading
}: FastConnectionRenewalSheetProps) {
  if (!open) return null;

  const passDays = quickiePassDays();
  const price = quickiePriceLabel();

  return (
    <div
      className="profile-boost-sheet fast-connection-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fast-connection-renewal-title"
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
              <h2 id="fast-connection-renewal-title">Fast Connection expired.</h2>
              <p className="profile-boost-sheet__subtitle">
                Continue connecting nearby with a new {passDays}-day pass.
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
          <button type="button" className="btn-primary btn-full" onClick={onRenew} disabled={loading}>
            {loading ? <Loader2 className="spin" size={20} /> : "Renew Fast Connection"}
          </button>
        </div>
      </div>
    </div>
  );
}
