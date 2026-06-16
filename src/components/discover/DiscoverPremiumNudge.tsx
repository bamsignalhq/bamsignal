import { MONETIZATION_COPY, SUCCESS_COPY } from "../../constants/copy";

type DiscoverPremiumNudgeProps = {
  onUpgrade: () => void;
};

export function DiscoverPremiumNudge({ onUpgrade }: DiscoverPremiumNudgeProps) {
  return (
    <aside className="discover-premium-nudge card">
      <p className="discover-premium-nudge__copy">{SUCCESS_COPY.emptyPremiumState}</p>
      <button type="button" className="btn-primary btn-full" onClick={onUpgrade}>
        {MONETIZATION_COPY.getSignalPass}
      </button>
    </aside>
  );
}
