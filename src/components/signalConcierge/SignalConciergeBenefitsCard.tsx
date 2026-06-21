import type { SignalConciergeTier } from "../../constants/signalConcierge";

type SignalConciergeBenefitsCardProps = {
  tier: SignalConciergeTier;
  onSelect?: (tierId: SignalConciergeTier["id"]) => void;
};

export function SignalConciergeBenefitsCard({ tier, onSelect }: SignalConciergeBenefitsCardProps) {
  return (
    <article className="signal-concierge-benefits-card signal-concierge-glass">
      <div className="signal-concierge-benefits-card__head">
        <h3 className="signal-concierge-benefits-card__tier">{tier.name}</h3>
        <p className="signal-concierge-benefits-card__tagline">{tier.tagline}</p>
        <p className="signal-concierge-benefits-card__price">{tier.priceLabel}</p>
      </div>
      {tier.regions?.length ? (
        <div className="signal-concierge-benefits-card__regions" aria-label="Regions">
          {tier.regions.map((region) => (
            <span key={region} className="signal-concierge-chip">
              {region}
            </span>
          ))}
        </div>
      ) : null}
      <ul className="signal-concierge-benefits-card__list">
        {tier.benefits.map((benefit) => (
          <li key={benefit}>
            <span aria-hidden>✦</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      {onSelect ? (
        <button
          type="button"
          className="signal-concierge-btn signal-concierge-btn--ghost"
          onClick={() => onSelect(tier.id)}
        >
          Explore {tier.tagline}
        </button>
      ) : null}
    </article>
  );
}
