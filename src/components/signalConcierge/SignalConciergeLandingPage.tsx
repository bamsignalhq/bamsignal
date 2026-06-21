import { useState } from "react";
import { SignalConciergeBeforeContinueModal } from "./SignalConciergeBeforeContinueModal";
import { SignalConciergeConfidentiality } from "./SignalConciergeConfidentiality";
import { SignalConciergeHero } from "./SignalConciergeHero";
import { SignalConciergeNextStep } from "./SignalConciergeNextStep";
import { SignalConciergeProcess } from "./SignalConciergeProcess";
import { SignalConciergePromises } from "./SignalConciergePromises";
import { SignalConciergeTierCards } from "./SignalConciergeTierCards";
import type { SignalConciergeTierId } from "../../constants/signalConcierge";

type SignalConciergeLandingPageProps = {
  onScheduleConsultation: () => void;
  onLearnMore: () => void;
  onSelectTier?: (tierId: SignalConciergeTierId) => void;
};

export function SignalConciergeLandingPage({
  onScheduleConsultation,
  onLearnMore,
  onSelectTier
}: SignalConciergeLandingPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const openConsultationFlow = () => setModalOpen(true);

  return (
    <div className="sc-landing">
      <SignalConciergeHero onScheduleConsultation={openConsultationFlow} onLearnMore={onLearnMore} />
      <SignalConciergeConfidentiality />
      <SignalConciergePromises />
      <SignalConciergeProcess />
      <SignalConciergeTierCards onSelectTier={onSelectTier} />
      <SignalConciergeNextStep
        onScheduleConsultation={openConsultationFlow}
        onMaybeLater={() => {
          const hero = document.getElementById("sc-hero-title");
          hero?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <SignalConciergeBeforeContinueModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onContinue={() => {
          setModalOpen(false);
          onScheduleConsultation();
        }}
      />
    </div>
  );
}
