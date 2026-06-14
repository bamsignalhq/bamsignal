type OffPlatformEducationModalProps = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export function OffPlatformEducationModal({ open, onClose, onContinue }: OffPlatformEducationModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop off-platform-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="off-platform-education-modal card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Before you continue off-app</h3>
        <p>
          BamSignal can't see or protect conversations on WhatsApp, Telegram, or other apps. Meet in public
          first, trust your instincts, and share less until you feel safe.
        </p>
        <p className="off-platform-education-modal__fine">
          We care about your experience here — we can't help with what happens outside the app.
        </p>
        <div className="off-platform-education-modal__actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Stay in app
          </button>
          <button type="button" className="btn-primary" onClick={onContinue}>
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
