import { Loader2 } from "lucide-react";
import { useState } from "react";
import { OFFLINE_SAFETY_COPY, COMPLIANCE_SAVE_FAIL } from "../constants/compliance";
import { saveComplianceAcknowledgements } from "../services/compliance";
import type { UserProfile } from "../types";

type OfflineSafetyAckModalProps = {
  open: boolean;
  user: Pick<UserProfile, "email" | "phone">;
  onComplete: () => void;
  onClose?: () => void;
};

export function OfflineSafetyAckModal({ open, user, onComplete, onClose }: OfflineSafetyAckModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const acknowledge = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await saveComplianceAcknowledgements(user, ["offline_safety"]);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || COMPLIANCE_SAVE_FAIL);
      return;
    }
    onComplete();
  };

  return (
    <div className="modal-backdrop compliance-gate" role="presentation">
      <div
        className="compliance-gate__panel card safety-ack-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offline-safety-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="compliance-gate__kicker">Before you continue</p>
        <h2 id="offline-safety-title" className="compliance-gate__title">
          {OFFLINE_SAFETY_COPY.title}
        </h2>
        <p className="compliance-gate__lede">If you choose to meet someone outside BamSignal:</p>
        <ul className="compliance-gate__rules">
          {OFFLINE_SAFETY_COPY.bullets.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
        <div className="safety-modal__actions">
          {onClose ? (
            <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            className="btn-primary compliance-gate__cta"
            onClick={() => void acknowledge()}
            disabled={busy}
          >
            {busy ? <Loader2 className="spin" size={20} /> : OFFLINE_SAFETY_COPY.cta}
          </button>
        </div>
        {error ? (
          <p className="compliance-gate__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
