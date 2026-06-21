import { SIGNAL_CONCIERGE_TIERS } from "../../constants/signalConcierge";
import type { SignalConciergeTierId } from "../../constants/signalConcierge";
import { SignalConciergeBenefitsCard } from "./SignalConciergeBenefitsCard";

type SignalConciergeTiersSectionProps = {
  onSelectTier?: (tierId: SignalConciergeTierId) => void;
};

export function SignalConciergeTiersSection({ onSelectTier }: SignalConciergeTiersSectionProps) {
  return (
    <section className="signal-concierge-section" aria-labelledby="sc-tiers-title">
      <h2 id="sc-tiers-title" className="signal-concierge-section__title">
        Membership Tiers
      </h2>
      <p className="signal-concierge-section__sub">
        Human-led matchmaking with thoughtful guidance at every level.
      </p>
      <div className="signal-concierge-tiers">
        {SIGNAL_CONCIERGE_TIERS.map((tier) => (
          <SignalConciergeBenefitsCard key={tier.id} tier={tier} onSelect={onSelectTier} />
        ))}
      </div>
    </section>
  );
}
