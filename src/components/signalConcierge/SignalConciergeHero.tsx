import {
  SIGNAL_CONCIERGE_CTA_PRIMARY,
  SIGNAL_CONCIERGE_CTA_SECONDARY,
  SIGNAL_CONCIERGE_HERO_TAG,
  SIGNAL_CONCIERGE_LANDING_HEADLINE,
  SIGNAL_CONCIERGE_LANDING_SUBTEXT
} from "../../constants/signalConcierge";

type SignalConciergeHeroProps = {
  onScheduleConsultation: () => void;
  onLearnMore: () => void;
};

export function SignalConciergeHero({ onScheduleConsultation, onLearnMore }: SignalConciergeHeroProps) {
  return (
    <section className="sc-hero" aria-labelledby="sc-hero-title">
      <div className="sc-hero__glow" aria-hidden />
      <p className="sc-hero__tag">{SIGNAL_CONCIERGE_HERO_TAG}</p>
      <h1 id="sc-hero-title" className="sc-hero__title">
        {SIGNAL_CONCIERGE_LANDING_HEADLINE}
      </h1>
      <p className="sc-hero__subtext">{SIGNAL_CONCIERGE_LANDING_SUBTEXT}</p>
      <div className="sc-hero__actions">
        <button type="button" className="signal-concierge-btn signal-concierge-btn--primary" onClick={onScheduleConsultation}>
          {SIGNAL_CONCIERGE_CTA_PRIMARY}
        </button>
        <button type="button" className="signal-concierge-btn signal-concierge-btn--ghost" onClick={onLearnMore}>
          {SIGNAL_CONCIERGE_CTA_SECONDARY}
        </button>
      </div>
    </section>
  );
}
