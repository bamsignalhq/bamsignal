import {
  SIGNAL_CONCIERGE_BEFORE_CONTINUE_BODY,
  SIGNAL_CONCIERGE_BEFORE_CONTINUE_TITLE,
  SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT,
  SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL,
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_MAYBE_LATER,
  SIGNAL_CONCIERGE_MEMBERSHIP_FROM,
  SIGNAL_CONCIERGE_PAYMENT_NOTE
} from "../../constants/signalConcierge";

type SignalConciergeBeforeContinueModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export function SignalConciergeBeforeContinueModal({
  open,
  onClose,
  onContinue
}: SignalConciergeBeforeContinueModalProps) {
  if (!open) return null;

  return (
    <div className="signal-concierge-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="signal-concierge-modal signal-concierge-glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sc-before-continue-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="sc-before-continue-title">{SIGNAL_CONCIERGE_BEFORE_CONTINUE_TITLE}</h2>
        <p>{SIGNAL_CONCIERGE_BEFORE_CONTINUE_BODY}</p>
        <p className="signal-concierge-modal__fee">
          {SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL} {SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT}
        </p>
        <p>{SIGNAL_CONCIERGE_MEMBERSHIP_FROM}</p>
        <p>{SIGNAL_CONCIERGE_PAYMENT_NOTE}</p>
        <div className="signal-concierge-modal__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onContinue}>
            {SIGNAL_CONCIERGE_CTA_PRIMARY}
          </button>
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onClose}>
            {SIGNAL_CONCIERGE_MAYBE_LATER}
          </button>
        </div>
      </div>
    </div>
  );
}
