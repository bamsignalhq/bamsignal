import { useState } from "react";
import {
  SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT,
  SIGNAL_CONCIERGE_CONSULTATION_FEE_LABEL,
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_PAYMENT_NOTE,
  SIGNAL_CONCIERGE_CONSULTATION_CHANNELS
} from "../../constants/signalConcierge";
import type { SignalConciergeConsultationChannel } from "../../constants/signalConcierge";
import {
  mergeSignalConciergeDraft,
  readSignalConciergeApplication,
  readSignalConciergeDraft,
  submitSignalConciergeApplication
} from "../../utils/signalConciergeStorage";

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

  const schedule = () => {
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
          Complete application first
        </button>
      </div>
    </section>
  );
}
