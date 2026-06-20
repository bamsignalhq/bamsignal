import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { SignupLegalCheckboxes, isSignupLegalComplete } from "./SignupLegalCheckboxes";
import { COMPLIANCE_SAVE_FAIL } from "../constants/compliance";
import { clearComplianceFlowState, dismissComplianceGateForever } from "../services/compliance";
import type { UserProfile } from "../types";
import { hasLegalCompliance, logComplianceSave } from "../utils/compliance";
import { getDatingProfile } from "../utils/profile";
import { clearFlowState } from "../utils/flowWatchdog";

type ComplianceGateModalProps = {
  user: UserProfile;
  onComplete: () => void;
};

export function ComplianceGateModal({ user, onComplete }: ComplianceGateModalProps) {
  const [legalAccepted, setLegalAccepted] = useState(() =>
    hasLegalCompliance(getDatingProfile().compliance)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const finishGate = useCallback(() => {
    clearComplianceFlowState();
    clearFlowState();
    onComplete();
  }, [onComplete]);

  const saveLegal = async () => {
    if (busy || !isSignupLegalComplete(legalAccepted)) return;
    setBusy(true);
    setError("");
    try {
      dismissComplianceGateForever(user);
      logComplianceSave({ ackTypes: ["terms", "privacy", "age_18"], ok: true, phase: "legal", dismissed: true });
      finishGate();
    } catch {
      setError(COMPLIANCE_SAVE_FAIL);
    } finally {
      setBusy(false);
    }
  };

  const legalReady = isSignupLegalComplete(legalAccepted);

  return (
    <div className="compliance-gate" role="dialog" aria-modal="true" aria-labelledby="compliance-gate-title">
      <div className="compliance-gate__backdrop" aria-hidden />
      <div className="compliance-gate__panel card">
        <p className="compliance-gate__kicker">Quick Safety Check</p>
        <h2 id="compliance-gate-title" className="compliance-gate__title">
          Before you continue
        </h2>
        <p className="compliance-gate__lede">
          To keep BamSignal safe, please confirm our latest terms and community standards.
        </p>

        <SignupLegalCheckboxes accepted={legalAccepted} onChange={setLegalAccepted} />

        <button
          type="button"
          className="btn-primary btn-full compliance-gate__cta"
          onClick={() => void saveLegal()}
          disabled={!legalReady || busy}
        >
          {busy ? <Loader2 className="spin" size={20} /> : "Continue"}
        </button>

        {error ? (
          <p className="compliance-gate__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
