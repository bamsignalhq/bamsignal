import { Loader2, X, Zap } from "lucide-react";
import { quickiePassDays, quickiePriceLabel } from "../../utils/quickie";
import { FAST_CONNECTION_DAILY_SIGNALS } from "../../utils/fastConnectionState";

type FastConnectionActivationSheetProps = {
  open: boolean;
  onClose: () => void;
  onActivate: () => void;
  loading?: boolean;
};

export function FastConnectionActivationSheet({
  open,
  onClose,
  onActivate,
  loading
}: FastConnectionActivationSheetProps) {
  if (!open) return null;

  const passDays = quickiePassDays();
  const price = quickiePriceLabel();

  return (
    <div
      className="profile-boost-sheet fast-connection-sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fast-connection-activation-title"
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
              <h2 id="fast-connection-activation-title">Activate Fast Connection</h2>
              <p className="profile-boost-sheet__subtitle">
                Connect with people nearby who also prefer faster conversations.
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close" disabled={loading}>
            <X size={20} />
          </button>
        </header>

        <p className="fast-connection-sheet__price">
          {price} / {passDays} days
        </p>
        <p className="profile-boost-sheet__subtitle">
          {FAST_CONNECTION_DAILY_SIGNALS} Fast Signals every 24 hours.
        </p>

        <div className="fast-connection-sheet__actions">
          <button type="button" className="btn-secondary btn-full" onClick={onClose} disabled={loading}>
            Maybe later
          </button>
          <button type="button" className="btn-primary btn-full" onClick={onActivate} disabled={loading}>
            {loading ? <Loader2 className="spin" size={20} /> : "Activate Fast Connection"}
          </button>
        </div>
      </div>
    </div>
  );
}
