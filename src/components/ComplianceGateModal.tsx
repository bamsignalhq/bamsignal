import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import { SignupLegalCheckboxes, isSignupLegalComplete } from "./SignupLegalCheckboxes";
import {
  ADULT_RISK_COPY,
  COMPLIANCE_SAVE_FAIL,
  OFFLINE_SAFETY_COPY,
  SAFETY_PLEDGE_RULES
} from "../constants/compliance";
import type { ComplianceAckType } from "../constants/compliance";
import { clearComplianceFlowState, saveComplianceAcknowledgements } from "../services/compliance";
import type { UserProfile } from "../types";
import {
  complianceGatePhase,
  hasLegalCompliance,
  isComplianceComplete,
  logComplianceSave,
  signupLegalAckTypes
} from "../utils/compliance";
import { getDatingProfile } from "../utils/profile";
import { clearFlowState } from "../utils/flowWatchdog";

type ComplianceGateModalProps = {
  user: UserProfile;
  onComplete: () => void;
};

function ackTypesForPhase(phase: ReturnType<typeof complianceGatePhase>): ComplianceAckType[] {
  switch (phase) {
    case "legal":
      return signupLegalAckTypes();
    case "pledge":
      return ["safety_pledge"];
    case "offline_safety":
      return ["offline_safety"];
    case "adult_risk":
      return ["adult_risk"];
    default:
      return [];
  }
}

export function ComplianceGateModal({ user, onComplete }: ComplianceGateModalProps) {
  const phase = complianceGatePhase(getDatingProfile().compliance);
  const [legalAccepted, setLegalAccepted] = useState(() =>
    hasLegalCompliance(getDatingProfile().compliance)
  );
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const finishGate = useCallback(() => {
    clearComplianceFlowState();
    clearFlowState();
    onComplete();
  }, [onComplete]);

  const canContinue =
    phase === "legal"
      ? isSignupLegalComplete(legalAccepted)
      : phase === "pledge"
        ? pledgeAccepted
        : phase === "offline_safety" || phase === "adult_risk";

  const saveStep = async () => {
    if (busy || !canContinue) return;
    const ackTypes = ackTypesForPhase(phase);
    if (!ackTypes.length) return;

    setBusy(true);
    setError("");
    try {
      const result = await saveComplianceAcknowledgements(user, ackTypes);
      logComplianceSave({ ackTypes, ok: result.ok, phase });
      if (!result.ok) {
        setError(result.error || COMPLIANCE_SAVE_FAIL);
        return;
      }
      if (result.compliance && isComplianceComplete(result.compliance)) {
        finishGate();
        return;
      }
      setPledgeAccepted(false);
      onComplete();
    } catch {
      setError(COMPLIANCE_SAVE_FAIL);
    } finally {
      setBusy(false);
    }
  };

  const title =
    phase === "legal"
      ? "Before you continue"
      : phase === "pledge"
        ? "Community pledge"
        : phase === "offline_safety"
          ? OFFLINE_SAFETY_COPY.title
          : ADULT_RISK_COPY.title;

  const kicker =
    phase === "pledge"
      ? "Keep BamSignal Safe"
      : phase === "adult_risk"
        ? "Scam awareness"
        : "Quick Safety Check";

  const ctaLabel =
    phase === "offline_safety"
      ? OFFLINE_SAFETY_COPY.cta
      : phase === "adult_risk"
        ? ADULT_RISK_COPY.cta
        : "Continue";

  return (
    <div className="compliance-gate" role="dialog" aria-modal="true" aria-labelledby="compliance-gate-title">
      <div className="compliance-gate__backdrop" aria-hidden />
      <div className="compliance-gate__panel card">
        <p className="compliance-gate__kicker">{kicker}</p>
        <h2 id="compliance-gate-title" className="compliance-gate__title">
          {title}
        </h2>

        {phase === "legal" ? (
          <>
            <p className="compliance-gate__lede">
              To keep BamSignal safe, please confirm our latest terms and community standards.
            </p>
            <SignupLegalCheckboxes accepted={legalAccepted} onChange={setLegalAccepted} />
          </>
        ) : null}

        {phase === "pledge" ? (
          <>
            <p className="compliance-gate__lede">
              Everyone on BamSignal agrees to these community standards:
            </p>
            <ul className="compliance-gate__rules">
              {SAFETY_PLEDGE_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <label className={`signup-legal__row${pledgeAccepted ? " signup-legal__row--checked" : ""}`}>
              <input
                type="checkbox"
                checked={pledgeAccepted}
                onChange={(event) => setPledgeAccepted(event.target.checked)}
              />
              <span className="signup-legal__copy">I agree to the community pledge</span>
            </label>
          </>
        ) : null}

        {phase === "offline_safety" ? (
          <>
            <p className="compliance-gate__lede">If you choose to meet someone outside BamSignal:</p>
            <ul className="compliance-gate__rules">
              {OFFLINE_SAFETY_COPY.bullets.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </>
        ) : null}

        {phase === "adult_risk" ? (
          <>
            <p className="compliance-gate__lede">{ADULT_RISK_COPY.body}</p>
            {ADULT_RISK_COPY.bullets?.length ? (
              <ul className="compliance-gate__rules">
                {ADULT_RISK_COPY.bullets.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}

        <button
          type="button"
          className="btn-primary btn-full compliance-gate__cta"
          onClick={() => void saveStep()}
          disabled={!canContinue || busy}
        >
          {busy ? <Loader2 className="spin" size={20} /> : ctaLabel}
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
