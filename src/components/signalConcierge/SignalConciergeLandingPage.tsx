import { useState } from "react";
import {
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_CTA_SECONDARY,
  SIGNAL_CONCIERGE_LANDING_HEADLINE,
  SIGNAL_CONCIERGE_LANDING_SUBTEXT,
  SIGNAL_CONCIERGE_PRIVATE_BODY,
  SIGNAL_CONCIERGE_PRIVATE_HEADLINE
} from "../../constants/signalConcierge";
import { SignalConciergeBeforeContinueModal } from "./SignalConciergeBeforeContinueModal";
import { SignalConciergeFAQ } from "./SignalConciergeFAQ";
import { SignalConciergePrivacySection } from "./SignalConciergePrivacySection";
import { SignalConciergePromisesSection } from "./SignalConciergePromisesSection";
import { SignalConciergeTiersSection } from "./SignalConciergeTiersSection";

type SignalConciergeLandingPageProps = {
  onScheduleConsultation: () => void;
  onLearnMore: () => void;
  onSelectTier?: () => void;
};

export function SignalConciergeLandingPage({
  onScheduleConsultation,
  onLearnMore,
  onSelectTier
}: SignalConciergeLandingPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const openConsultationFlow = () => setModalOpen(true);

  return (
    <>
      <section className="signal-concierge-hero">
        <h1>{SIGNAL_CONCIERGE_LANDING_HEADLINE}</h1>
        <p>{SIGNAL_CONCIERGE_LANDING_SUBTEXT}</p>
        <div className="signal-concierge-hero__actions">
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--primary"
            onClick={openConsultationFlow}
          >
            {SIGNAL_CONCIERGE_CTA_PRIMARY}
          </button>
          <button
            type="button"
            className="signal-concierge-btn signal-concierge-btn--ghost"
            onClick={onLearnMore}
          >
            {SIGNAL_CONCIERGE_CTA_SECONDARY}
          </button>
        </div>
      </section>

      <section className="signal-concierge-section signal-concierge-glass" style={{ padding: 22 }}>
        <h2 className="signal-concierge-section__title">{SIGNAL_CONCIERGE_PRIVATE_HEADLINE}</h2>
        <p className="signal-concierge-section__sub">{SIGNAL_CONCIERGE_PRIVATE_BODY}</p>
      </section>

      <SignalConciergePromisesSection />
      <SignalConciergeTiersSection onSelectTier={onSelectTier ? () => onSelectTier() : undefined} />
      <SignalConciergePrivacySection />
      <SignalConciergeFAQ />

      <section className="signal-concierge-section" style={{ textAlign: "center" }}>
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--primary"
          onClick={openConsultationFlow}
        >
          {SIGNAL_CONCIERGE_CTA_PRIMARY}
        </button>
      </section>

      <SignalConciergeBeforeContinueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onContinue={() => {
          setModalOpen(false);
          onScheduleConsultation();
        }}
      />
    </>
  );
}
