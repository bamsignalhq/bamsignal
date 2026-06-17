type DisableContactSharingModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DisableContactSharingModal({ open, onClose, onConfirm }: DisableContactSharingModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="safety-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h3>Stop future contact sharing?</h3>
        <p className="safety-modal__lead">
          This will disable contact sharing for this conversation. Already-shared information stays as it is.
          Either of you can request contact exchange again later.
        </p>
        <div className="safety-modal__actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            Disable
          </button>
        </div>
      </div>
    </div>
  );
}
