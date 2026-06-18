import { Star } from "lucide-react";
import { PREMIUM_COPY } from "../../constants/copy";

type DiscoverSignalPassPillProps = {
  onClick: () => void;
};

export function DiscoverSignalPassPill({ onClick }: DiscoverSignalPassPillProps) {
  return (
    <button type="button" className="discover-signal-pass-pill" onClick={onClick}>
      <Star size={14} aria-hidden fill="currentColor" />
      <span className="discover-signal-pass-pill__label">{PREMIUM_COPY.discoverPillTitle}</span>
      <span className="discover-signal-pass-pill__hint">{PREMIUM_COPY.discoverPillHint}</span>
    </button>
  );
}
