import { useMemo, useState } from "react";
import { SignupLegalCheckboxes, isSignupLegalComplete } from "./SignupLegalCheckboxes";
import {
  ADULT_RISK_COPY,
  COMPLIANCE_SAVE_FAIL,
  SAFETY_PLEDGE_RULES
} from "../constants/compliance";
import { saveComplianceAcknowledgements } from "../services/compliance";
import type { UserProfile } from "../types";
import {
  complianceGatePhase,
  hasAdultRiskAck,
  hasLegalCompliance,
  hasSafetyPledge
} from "../utils/compliance";
import { getDatingProfile } from "../utils/profile";
import { Loader2 } from "lucide-react";

type ComplianceGateModalProps = {
  user: UserProfile;
  onComplete: () => void;
};

type GatePhase = "legal" | "pledge" | "adult_risk";

export function ComplianceGateModal({ user, onComplete }: ComplianceGateModalProps) {
  const initialPhase = useMemo((): GatePhase => {
    const phase = complianceGatePhase(getDatingProfile().compliance);
    if (phase === "pledge" || phase === "adult_risk") return phase;
    return "legal";
  }, []);
  const [phase, setPhase] = useState<GatePhase>(initialPhase);
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
      if (hasAdultRiskAck(result.compliance)) {
        onComplete();
        return;
      }
      setPhase("adult_risk");
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
    if (hasAdultRiskAck(result.compliance)) {
      onComplete();
      return;
    }
    setPhase("adult_risk");
  };

  const saveAdultRisk = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = await saveComplianceAcknowledgements(user, ["adult_risk"]);
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
        ) : phase === "pledge" ? (
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
        ) : (
          <>
            <p className="compliance-gate__kicker">Stay aware</p>
            <h2 id="compliance-gate-title" className="compliance-gate__title">
              {ADULT_RISK_COPY.title}
            </h2>
            <p className="compliance-gate__lede">{ADULT_RISK_COPY.body}</p>

            <button
              type="button"
              className="btn-primary btn-full compliance-gate__cta"
              onClick={() => void saveAdultRisk()}
              disabled={busy}
            >
              {busy ? <Loader2 className="spin" size={20} /> : ADULT_RISK_COPY.cta}
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
