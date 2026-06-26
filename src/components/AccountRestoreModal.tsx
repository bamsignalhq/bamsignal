type AccountRestoreModalProps = {
  open: boolean;
  scheduledFor?: string | null;
  busy?: boolean;
  onContinueDeletion: () => void;
  onRestore: () => void;
};

function formatDate(value?: string | null) {
  if (!value) return "soon";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return value;
  }
}

export function AccountRestoreModal({
  open,
  scheduledFor,
  busy,
  onContinueDeletion,
  onRestore
}: AccountRestoreModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card account-restore-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-restore-title"
      >
        <h2 id="account-restore-title">Restore your account?</h2>
        <p>
          Your BamSignal account is scheduled for deletion
          {scheduledFor ? ` on ${formatDate(scheduledFor)}` : ""}. You can restore it before permanent
          deletion.
        </p>
        <div className="delete-account-modal__actions">
          <button
            type="button"
            className="btn-secondary btn-full"
            disabled={busy}
            onClick={onContinueDeletion}
          >
            Continue Deletion
          </button>
          <button type="button" className="btn-primary btn-full" disabled={busy} onClick={onRestore}>
            {busy ? "Restoring…" : "Restore Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
