import {
  SIGNAL_CONCIERGE_STATUS_LABELS,
  SIGNAL_CONCIERGE_TIERS
} from "../../constants/signalConcierge";
import { JourneyIdCard } from "./JourneyIdCard";
import { readSignalConciergeApplication } from "../../utils/signalConciergeStorage";

type SignalConciergeStatusPageProps = {
  onApply: () => void;
  onScheduleConsultation: () => void;
};

export function SignalConciergeStatusPage({
  onApply,
  onScheduleConsultation
}: SignalConciergeStatusPageProps) {
  const application = readSignalConciergeApplication();

  if (!application) {
    return (
      <section className="signal-concierge-status signal-concierge-glass">
        <h1 className="signal-concierge-section__title">Application Status</h1>
        <p className="signal-concierge-section__sub">
          You have not started a Signal Concierge application yet.
        </p>
        <div className="signal-concierge-hero__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onApply}>
            Begin application
          </button>
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--ghost"
            onClick={onScheduleConsultation}
          >
            Schedule consultation
          </button>
        </div>
      </section>
    );
  }

  const tier = SIGNAL_CONCIERGE_TIERS.find((item) => item.id === application.preferredTier);

  return (
    <section className="signal-concierge-status signal-concierge-glass">
      <h1 className="signal-concierge-section__title">Application Status</h1>
      {application.journeyId ? <JourneyIdCard journeyId={application.journeyId} /> : null}
      <span className="signal-concierge-status__badge">
        {SIGNAL_CONCIERGE_STATUS_LABELS[application.status]}
      </span>
      <p className="signal-concierge-section__sub">
        Submitted {new Date(application.updatedAt).toLocaleString()}
      </p>
      {tier ? (
        <p className="signal-concierge-section__sub">
          Preferred tier: {tier.name} ({tier.tagline})
        </p>
      ) : null}
      {application.consultationPreference ? (
        <p className="signal-concierge-section__sub">
          Consultation preference: {application.consultationPreference.replace("-", " ")}
        </p>
      ) : null}
      <p className="signal-concierge-section__sub">
        Your profile remains private and outside public BamSignal surfaces.
      </p>
      <div className="signal-concierge-hero__actions">
        <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onApply}>
          Update application
        </button>
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--primary"
          onClick={onScheduleConsultation}
        >
          Schedule consultation
        </button>
      </div>
    </section>
  );
}
