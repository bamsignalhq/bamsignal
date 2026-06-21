import {
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_MAYBE_LATER,
  SIGNAL_CONCIERGE_NEXT_STEP_HEADLINE,
  SIGNAL_CONCIERGE_NEXT_STEP_SUBTEXT
} from "../../constants/signalConcierge";

type SignalConciergeNextStepProps = {
  onScheduleConsultation: () => void;
  onMaybeLater?: () => void;
};

export function SignalConciergeNextStep({ onScheduleConsultation, onMaybeLater }: SignalConciergeNextStepProps) {
  return (
    <section className="sc-section sc-next-step" aria-labelledby="sc-next-step-title">
      <div className="sc-next-step__card signal-concierge-glass sc-reveal">
        <div className="sc-next-step__glow" aria-hidden />
        <h2 id="sc-next-step-title" className="sc-next-step__title">
          {SIGNAL_CONCIERGE_NEXT_STEP_HEADLINE}
        </h2>
        <p className="sc-next-step__subtext">{SIGNAL_CONCIERGE_NEXT_STEP_SUBTEXT}</p>
        <div className="sc-next-step__actions">
          <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onScheduleConsultation}>
            {SIGNAL_CONCIERGE_CTA_PRIMARY}
          </button>
          {onMaybeLater ? (
            <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onMaybeLater}>
              {SIGNAL_CONCIERGE_MAYBE_LATER}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
