import { useCallback, useRef, useState } from "react";
import { STORAGE_KEYS } from "../../constants/limits";
import {
  SIGNAL_CONCIERGE_BEFORE_CONTINUE_BODY,
  SIGNAL_CONCIERGE_BEFORE_CONTINUE_TITLE,
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_MAYBE_LATER,
  SIGNAL_CONCIERGE_NO_OBLIGATION_NOTE,
  SIGNAL_CONCIERGE_PAYMENT_NOTE
} from "../../constants/signalConcierge";
import { readJson, writeJson } from "../../utils/storage";
import { SignalConciergeConsultationCard } from "./SignalConciergeConsultationCard";
import { SignalConciergeExpectationsCard } from "./SignalConciergeExpectationsCard";
import { SignalConciergeNoPressureCard } from "./SignalConciergeNoPressureCard";

type SignalConciergeBeforeContinueModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export function hasSignalConciergeGatePassed(): boolean {
  return Boolean(readJson(STORAGE_KEYS.signalConciergeGatePassed, false));
}

export function markSignalConciergeGatePassed(): void {
  writeJson(STORAGE_KEYS.signalConciergeGatePassed, true);
}

export function useSignalConciergeBeforeContinue() {
  const [open, setOpen] = useState(false);
  const onContinueRef = useRef<(() => void) | null>(null);

  const requestGate = useCallback((onContinue: () => void, options?: { force?: boolean }) => {
    if (!options?.force && hasSignalConciergeGatePassed()) {
      onContinue();
      return;
    }
    onContinueRef.current = onContinue;
    setOpen(true);
  }, []);

  const handleContinue = useCallback(() => {
    markSignalConciergeGatePassed();
    setOpen(false);
    onContinueRef.current?.();
    onContinueRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    onContinueRef.current = null;
  }, []);

  const modal = (
    <SignalConciergeBeforeContinueModal open={open} onClose={handleClose} onContinue={handleContinue} />
  );

  return { requestGate, modal, gateOpen: open };
}

export function SignalConciergeBeforeContinueModal({
  open,
  onClose,
  onContinue
}: SignalConciergeBeforeContinueModalProps) {
  if (!open) return null;

  return (
    <div className="signal-concierge-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="signal-concierge-modal signal-concierge-glass sc-gate-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sc-before-continue-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sc-gate-modal__header">
          <h2 id="sc-before-continue-title" className="sc-gate-modal__title">
            {SIGNAL_CONCIERGE_BEFORE_CONTINUE_TITLE}
          </h2>
          <p className="sc-gate-modal__intro">{SIGNAL_CONCIERGE_BEFORE_CONTINUE_BODY}</p>
        </header>

        <div className="sc-gate-modal__cards">
          <SignalConciergeConsultationCard />
          <SignalConciergeExpectationsCard />
          <SignalConciergeNoPressureCard />
        </div>

        <div className="sc-gate-modal__notes">
          <p>{SIGNAL_CONCIERGE_PAYMENT_NOTE}</p>
          <p>{SIGNAL_CONCIERGE_NO_OBLIGATION_NOTE}</p>
        </div>

        <div className="signal-concierge-modal__actions sc-gate-modal__actions">
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
