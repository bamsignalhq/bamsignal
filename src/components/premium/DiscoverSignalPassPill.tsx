import { Star } from "lucide-react";
import { PREMIUM_COPY } from "../../constants/copy";
import { usePremiumCheckout } from "../../context/PremiumCheckoutContext";

type DiscoverSignalPassPillProps = {
  onClick: () => void;
};

export function DiscoverSignalPassPill({ onClick }: DiscoverSignalPassPillProps) {
  const checkout = usePremiumCheckout();

  return (
    <button
      type="button"
      className="discover-signal-pass-pill"
      onClick={onClick}
      disabled={checkout.busy}
      aria-busy={checkout.busy}
    >
      <Star size={14} aria-hidden fill="currentColor" />
      <span className="discover-signal-pass-pill__label">{PREMIUM_COPY.discoverPillTitle}</span>
      <span className="discover-signal-pass-pill__hint">
        {checkout.busy ? checkout.label : PREMIUM_COPY.discoverPillHint}
      </span>
    </button>
  );
}
