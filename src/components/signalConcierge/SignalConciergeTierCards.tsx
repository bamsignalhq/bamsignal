import { SIGNAL_CONCIERGE_TIERS } from "../../constants/signalConcierge";
import type { SignalConciergeTierId } from "../../constants/signalConcierge";

type SignalConciergeTierCardsProps = {
  onSelectTier?: (tierId: SignalConciergeTierId) => void;
};

export function SignalConciergeTierCards({ onSelectTier }: SignalConciergeTierCardsProps) {
  return (
    <section className="sc-section" aria-labelledby="sc-tiers-title">
      <h2 id="sc-tiers-title" className="sc-section__eyebrow">
        Membership
      </h2>
      <p className="sc-section__lead sc-section__lead--center">
        Thoughtful guidance at every level of your journey.
      </p>
      <div className="sc-tier-cards">
        {SIGNAL_CONCIERGE_TIERS.map((tier, index) => (
          <article
            key={tier.id}
            className="sc-tier-card signal-concierge-glass sc-reveal"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <p className="sc-tier-card__name">{tier.landingName}</p>
            <p className="sc-tier-card__tagline">{tier.tagline}</p>
            <p className="sc-tier-card__price">{tier.priceLabel}</p>
            {onSelectTier ? (
              <button
                type="button"
                className="signal-concierge-btn signal-concierge-btn--ghost sc-tier-card__cta"
                onClick={() => onSelectTier(tier.id)}
              >
                Begin application
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
