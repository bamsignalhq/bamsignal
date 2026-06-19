import { useCallback, useEffect, useMemo, useState } from "react";
import { SignupLegalCheckboxes, isSignupLegalComplete } from "./SignupLegalCheckboxes";
import {
  ADULT_RISK_COPY,
  COMPLIANCE_SAVE_FAIL,
  SAFETY_PLEDGE_RULES,
  type ComplianceAckType
} from "../constants/compliance";
import {
  clearComplianceFlowState,
  saveComplianceAcknowledgements
} from "../services/compliance";
import { continueComplianceSafely, repairMemberFlow } from "../services/flowRepair";
import type { UserProfile } from "../types";
import {
  complianceGatePhase,
  hasAdultRiskAck,
  hasLegalCompliance,
  isComplianceComplete,
  logComplianceSave
} from "../utils/compliance";
import { getDatingProfile } from "../utils/profile";
import { useFlowWatchdog } from "../hooks/useFlowWatchdog";
import { clearFlowState } from "../utils/flowWatchdog";
import { FlowWatchdogRecovery } from "./FlowWatchdogRecovery";
import { Loader2 } from "lucide-react";

type ComplianceGateModalProps = {
  user: UserProfile;
  onComplete: () => void;
};

type GatePhase = "legal" | "pledge" | "adult_risk";

function currentAckTypes(phase: GatePhase): ComplianceAckType[] {
  if (phase === "legal") return ["terms", "privacy", "age_18"];
  if (phase === "pledge") return ["safety_pledge"];
  return ["adult_risk"];
}

export function ComplianceGateModal({ user, onComplete }: ComplianceGateModalProps) {
  const initialPhase = useMemo((): GatePhase => {
    const gate = complianceGatePhase(getDatingProfile().compliance);
    if (gate === "pledge" || gate === "adult_risk") return gate;
    return "legal";
  }, []);
  const [phase, setPhase] = useState<GatePhase>(initialPhase);
  const [legalAccepted, setLegalAccepted] = useState(() =>
    hasLegalCompliance(getDatingProfile().compliance)
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const userId = user.email || user.phone || undefined;
  const flowName =
    phase === "pledge" ? "compliance_pledge" : phase === "adult_risk" ? "adult_risk_modal" : "compliance_pledge";
  const { stuck, reset: resetWatchdog } = useFlowWatchdog(
    flowName,
    true,
    window.location.pathname,
    userId
  );

  const finishGate = useCallback(() => {
    clearComplianceFlowState();
    clearFlowState();
    onComplete();
  }, [onComplete]);

  const advanceAfterSave = useCallback(
    (compliance = getDatingProfile().compliance) => {
      if (isComplianceComplete(compliance)) {
        finishGate();
        return;
      }
      const next = complianceGatePhase(compliance);
      if (next === "adult_risk" || next === "pledge" || next === "legal") {
        setPhase(next);
        return;
      }
      finishGate();
    },
    [finishGate]
  );

  const runSave = useCallback(
    async (ackTypes: ComplianceAckType[]) => {
      if (busy) return;
      setBusy(true);
      setError("");
      resetWatchdog();
      try {
        const result = await saveComplianceAcknowledgements(user, ackTypes);
        const compliance = result.compliance ?? getDatingProfile().compliance;
        logComplianceSave({
          ackTypes,
          ok: result.ok,
          phase,
          next: complianceGatePhase(compliance)
        });
        if (!result.ok) {
          setError(result.error || COMPLIANCE_SAVE_FAIL);
          return;
        }
        advanceAfterSave(compliance);
      } finally {
        setBusy(false);
      }
    },
    [advanceAfterSave, busy, phase, resetWatchdog, user]
  );

  const saveLegal = () => void runSave(["terms", "privacy", "age_18"]);
  const savePledge = () => void runSave(["safety_pledge"]);
  const saveAdultRisk = () => void runSave(["adult_risk"]);

  const handleTryAgain = () => {
    resetWatchdog();
    setError("");
    if (phase === "legal") saveLegal();
    else if (phase === "pledge") savePledge();
    else saveAdultRisk();
  };

  const handleContinueSafely = async () => {
    if (phase === "legal") return;
    setBusy(true);
    setError("");
    try {
      const ackTypes = currentAckTypes(phase);
      await continueComplianceSafely(user, ackTypes);
      const compliance = getDatingProfile().compliance;
      if (phase === "pledge" && !hasAdultRiskAck(compliance)) {
        setPhase("adult_risk");
        return;
      }
      finishGate();
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!stuck) return;
    logComplianceSave({ phase, stuck: true, action: "watchdog_triggered" });
    void repairMemberFlow(user, {
      flowName,
      currentRoute: window.location.pathname,
      clientState: {
        compliancePhase: phase,
        pendingAcks: currentAckTypes(phase)
      }
    }).then((result) => {
      if (result.compliance) advanceAfterSave(result.compliance);
    });
  }, [advanceAfterSave, flowName, phase, stuck, user]);

  const legalReady = isSignupLegalComplete(legalAccepted);
  const showContinueSafely = phase !== "legal" && (stuck || Boolean(error));

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

            <SignupLegalCheckboxes accepted={legalAccepted} onChange={setLegalAccepted} />

            <button
              type="button"
              className="btn-primary btn-full compliance-gate__cta"
              onClick={saveLegal}
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
              onClick={savePledge}
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
              onClick={saveAdultRisk}
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

        {stuck || error ? (
          <FlowWatchdogRecovery
            onTryAgain={handleTryAgain}
            onContinueSafely={handleContinueSafely}
            showContinueSafely={showContinueSafely}
          />
        ) : null}
      </div>
    </div>
  );
}
