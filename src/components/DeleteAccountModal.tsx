import { useState } from "react";
import { X } from "lucide-react";

type DeleteAccountModalProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAccountModal({ open, busy, onClose, onConfirm }: DeleteAccountModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");

  if (!open) return null;

  const reset = () => {
    setStep(1);
    setConfirmText("");
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div
        className="modal-card delete-account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={close} aria-label="Close">
          <X size={18} />
        </button>
        {step === 1 ? (
          <>
            <h2 id="delete-account-title">Delete your BamSignal account?</h2>
            <p>
              Your profile will be hidden immediately. Your account and associated data will be scheduled
              for permanent deletion.
            </p>
            <div className="delete-account-modal__actions">
              <button type="button" className="btn-secondary btn-full" onClick={close} disabled={busy}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger btn-full"
                disabled={busy}
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="delete-account-title">Type DELETE to confirm</h2>
            <p>Permanent deletion is scheduled 30 days from now. You can restore by logging in before then.</p>
            <input
              className="profile-form-row__input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
            <div className="delete-account-modal__actions">
              <button type="button" className="btn-secondary btn-full" onClick={() => setStep(1)} disabled={busy}>
                Back
              </button>
              <button
                type="button"
                className="btn-danger btn-full"
                disabled={busy || confirmText.trim().toUpperCase() !== "DELETE"}
                onClick={() => {
                  onConfirm();
                  reset();
                }}
              >
                {busy ? "Scheduling…" : "Schedule Deletion"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
