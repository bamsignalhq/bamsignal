import { MONETIZATION_COPY, PREMIUM_COPY } from "../../constants/copy";

type DiscoverPremiumNudgeProps = {
  onUpgrade: () => void;
};

export function DiscoverPremiumNudge({ onUpgrade }: DiscoverPremiumNudgeProps) {
  return (
    <aside className="discover-premium-nudge card">
      <p className="discover-premium-nudge__copy">{PREMIUM_COPY.signalsEmptyBody}</p>
      <button type="button" className="btn-primary btn-full" onClick={onUpgrade}>
        {MONETIZATION_COPY.upgradeToday}
      </button>
    </aside>
  );
}
