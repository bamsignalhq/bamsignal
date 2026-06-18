import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { SignupLegalCheckboxes, isSignupLegalComplete } from "./SignupLegalCheckboxes";
import { COMPLIANCE_SAVE_FAIL, SAFETY_PLEDGE_RULES } from "../constants/compliance";
import { saveComplianceAcknowledgements } from "../services/compliance";
import type { UserProfile } from "../types";
import {
  complianceGatePhase,
  hasLegalCompliance,
  hasSafetyPledge
} from "../utils/compliance";
import { getDatingProfile } from "../utils/profile";

type ComplianceGateModalProps = {
  user: UserProfile;
  onComplete: () => void;
};

export function ComplianceGateModal({ user, onComplete }: ComplianceGateModalProps) {
  const initialPhase = useMemo(
    () => complianceGatePhase(getDatingProfile().compliance),
    []
  );
  const [phase, setPhase] = useState<"legal" | "pledge">(
    initialPhase === "pledge" ? "pledge" : "legal"
  );
  const [termsAccepted, setTermsAccepted] = useState(() =>
    hasLegalCompliance(getDatingProfile().compliance)
  );
  const [privacyAccepted, setPrivacyAccepted] = useState(() =>
    hasLegalCompliance(getDatingProfile().compliance)
  );
  const [ageConfirmed, setAgeConfirmed] = useState(() =>
    hasLegalCompliance(getDatingProfile().compliance)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const legalReady = isSignupLegalComplete(termsAccepted, privacyAccepted, ageConfirmed);

  const saveLegal = async () => {
    if (!legalReady || busy) return;
    setBusy(true);
    setError("");
    const result = await saveComplianceAcknowledgements(user, ["terms", "privacy", "age_18"]);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || COMPLIANCE_SAVE_FAIL);
      return;
    }
    if (hasSafetyPledge(result.compliance)) {
      onComplete();
      return;
    }
    setPhase("pledge");
  };

  const savePledge = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await saveComplianceAcknowledgements(user, ["safety_pledge"]);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || COMPLIANCE_SAVE_FAIL);
      return;
    }
    onComplete();
  };

  return (
    <div className="compliance-gate" role="dialog" aria-modal="true" aria-labelledby="compliance-gate-title">
      <div className="compliance-gate__backdrop" aria-hidden />
      <div className="compliance-gate__panel card">
        {phase === "legal" ? (
          <>
            <p className="compliance-gate__kicker">Quick Safety Check</p>
            <h2 id="compliance-gate-title" className="compliance-gate__title">
              Before you continue
            </h2>
            <p className="compliance-gate__lede">
              To keep BamSignal safe, please confirm our latest terms and community standards.
            </p>

            <SignupLegalCheckboxes
              termsAccepted={termsAccepted}
              privacyAccepted={privacyAccepted}
              ageConfirmed={ageConfirmed}
              onTermsChange={setTermsAccepted}
              onPrivacyChange={setPrivacyAccepted}
              onAgeChange={setAgeConfirmed}
            />

            <button
              type="button"
              className="btn-primary btn-full compliance-gate__cta"
              onClick={() => void saveLegal()}
              disabled={!legalReady || busy}
            >
              {busy ? <Loader2 className="spin" size={20} /> : "Continue"}
            </button>
          </>
        ) : (
          <>
            <p className="compliance-gate__kicker">Community pledge</p>
            <h2 id="compliance-gate-title" className="compliance-gate__title">
              Keep BamSignal Safe ❤️
            </h2>
            <p className="compliance-gate__lede">Before you continue, please agree to our community pledge.</p>

            <ul className="compliance-gate__rules">
              {SAFETY_PLEDGE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>

            <button
              type="button"
              className="btn-primary btn-full compliance-gate__cta"
              onClick={() => void savePledge()}
              disabled={busy}
            >
              {busy ? <Loader2 className="spin" size={20} /> : "I Pledge To Play Safe"}
            </button>
          </>
        )}

        {error ? (
          <p className="compliance-gate__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
