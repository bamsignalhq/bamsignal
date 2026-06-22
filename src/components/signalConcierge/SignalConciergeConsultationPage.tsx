import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT,
  SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL,
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_PAYMENT_NOTE,
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS
} from "../../constants/signalConcierge";
import { CONSULTATION_PAYMENT_MEMBERSHIP_NOTE } from "../../constants/consultationPayment";
import type { SignalConciergeConsultationChannel } from "../../constants/signalConcierge";
import {
  consultationPaymentCallbackActive,
  deriveConsultationPaymentPhase,
  getConsultationPaymentState,
  startConsultationPaymentCheckout,
  verifyConsultationPayment,
  type ConsultationPaymentPhase
} from "../../services/consultationPayment";
import {
  mergeSignalConciergeDraft,
  readSignalConciergeApplication,
  readSignalConciergeDraft,
  submitSignalConciergeApplication
} from "../../utils/signalConciergeStorage";
import { PaymentFailureCard } from "./PaymentFailureCard";
import { PaymentPendingCard } from "./PaymentPendingCard";
import { PaymentSuccessCard } from "./PaymentSuccessCard";

type SignalConciergeConsultationPageProps = {
  onScheduled: () => void;
  onApply: () => void;
};

export function SignalConciergeConsultationPage({
  onScheduled,
  onApply
}: SignalConciergeConsultationPageProps) {
  const draft = readSignalConciergeDraft();
  const application = readSignalConciergeApplication();
  const [selected, setSelected] = useState<SignalConciergeConsultationChannel>(
    () =>
      draft.consultationPreference ??
      application?.consultationPreference ??
      "whatsapp"
  );
  const [phase, setPhase] = useState<ConsultationPaymentPhase>("idle");
  const [paymentError, setPaymentError] = useState("");
  const [paying, setPaying] = useState(false);
  const [tick, setTick] = useState(0);

  const paymentState = useMemo(() => {
    if (!application) return null;
    return getConsultationPaymentState(application);
  }, [application, tick]);

  const resolvedPhase = useMemo(() => {
    if (!application) return "idle" as ConsultationPaymentPhase;
    if (phase === "verifying" || phase === "failed") {
      return deriveConsultationPaymentPhase(application, phase === "verifying" ? "verifying" : "failed");
    }
    return deriveConsultationPaymentPhase(application);
  }, [application, phase]);

  const consultationEligible = Boolean(paymentState?.summary.consultationEligible);

  const refreshPayment = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (!application || !consultationPaymentCallbackActive()) return;
    let cancelled = false;

    const run = async () => {
      setPhase("verifying");
      const result = await verifyConsultationPayment(application);
      if (cancelled) return;
      if (result.ok) {
        setPhase("paid");
        setPaymentError("");
        refreshPayment();
        return;
      }
      if (result.phase === "pending") {
        setPhase("pending");
        return;
      }
      setPhase("failed");
      setPaymentError(result.error || "");
      refreshPayment();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [application, refreshPayment]);

  const payConsultation = async () => {
    if (!application || paying) return;
    setPaying(true);
    setPaymentError("");
    setPhase("preparing");
    const result = await startConsultationPaymentCheckout(application);
    setPaying(false);
    refreshPayment();

    if (result.ok) {
      setPhase(result.phase || "paid");
      return;
    }

    if (result.cancelled) {
      setPhase("pending");
      return;
    }

    if (result.redirected) {
      setPhase("pending");
      return;
    }

    setPhase(result.phase || "failed");
    setPaymentError(result.error || "");
  };

  const schedule = () => {
    if (!consultationEligible) return;
    const next = mergeSignalConciergeDraft({
      consultationPreference: selected,
      status: "consultation-scheduled",
      consultationScheduledAt: new Date().toISOString()
    });
    submitSignalConciergeApplication({
      ...next,
      status: "consultation-scheduled",
      consultationScheduledAt: new Date().toISOString()
    });
    onScheduled();
  };

  if (!application || !paymentState) {
    return (
      <section className="signal-concierge-consultation signal-concierge-glass">
        <h1 className="signal-concierge-section__title">Schedule Consultation</h1>
        <p className="signal-concierge-section__sub">Begin your application before scheduling a consultation.</p>
        <div className="signal-concierge-hero__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onApply}>
            Complete application first
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="signal-concierge-consultation signal-concierge-glass">
      <h1 className="signal-concierge-section__title">Schedule Consultation</h1>
      <p className="signal-concierge-section__sub">
        A confidential conversation with our team to understand your goals and determine fit.
      </p>
      <p className="signal-concierge-modal__fee">
        {SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL} {SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT}
      </p>
      <p className="signal-concierge-section__sub">{SIGNAL_CONCIERGE_PAYMENT_NOTE}</p>
      <p className="consultation-payment-status-card__note">{CONSULTATION_PAYMENT_MEMBERSHIP_NOTE}</p>

      {resolvedPhase === "paid" ? <PaymentSuccessCard summary={paymentState.summary} /> : null}
      {resolvedPhase === "pending" || resolvedPhase === "verifying" ? <PaymentPendingCard /> : null}
      {resolvedPhase === "failed" ? (
        <PaymentFailureCard message={paymentError} onRetry={() => void payConsultation()} />
      ) : null}

      {!consultationEligible ? (
        <div className="signal-concierge-hero__actions consultation-payment-actions">
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--primary"
            onClick={() => void payConsultation()}
            disabled={paying || resolvedPhase === "verifying"}
          >
            {paying || resolvedPhase === "preparing" ? "Opening checkout…" : "Pay consultation fee"}
          </button>
          <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onApply}>
            Complete application first
          </button>
        </div>
      ) : (
        <>
          <div className="signal-concierge-channel-grid">
            {SIGNAL_CONCIERGE_CONSULTATION_CHANNELS.map((channel) => {
              const active = selected === channel.id;
              return (
                <button
                  key={channel.id}
                  type="button"
                  className={`signal-concierge-channel${active ? " signal-concierge-channel--selected" : ""}`}
                  onClick={() => {
                    setSelected(channel.id);
                    mergeSignalConciergeDraft({ consultationPreference: channel.id });
                  }}
                >
                  <span>{channel.label}</span>
                  {active ? <span aria-hidden>✓</span> : null}
                </button>
              );
            })}
          </div>

          <div className="signal-concierge-hero__actions">
            <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={schedule}>
              {SIGNAL_CONCIERGE_CTA_PRIMARY}
            </button>
            <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onApply}>
              Update application
            </button>
          </div>
        </>
      )}
    </section>
  );
}
