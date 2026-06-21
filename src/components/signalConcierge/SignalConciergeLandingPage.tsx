import { useSignalConciergeBeforeContinue } from "./SignalConciergeBeforeContinueModal";
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
  const { requestGate, modal } = useSignalConciergeBeforeContinue();

  const openConsultationFlow = () => requestGate(onScheduleConsultation);
  const openApplyFlow = (tierId: SignalConciergeTierId) => {
    if (!onSelectTier) return;
    requestGate(() => onSelectTier(tierId));
  };

  return (
    <div className="sc-landing">
      <SignalConciergeHero onScheduleConsultation={openConsultationFlow} onLearnMore={onLearnMore} />
      <SignalConciergeConfidentiality />
      <SignalConciergePromises />
      <SignalConciergeProcess />
      <SignalConciergeTierCards onSelectTier={onSelectTier ? openApplyFlow : undefined} />
      <SignalConciergeNextStep
        onScheduleConsultation={openConsultationFlow}
        onMaybeLater={() => {
          document.getElementById("sc-hero-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />
      {modal}
    </div>
  );
}
