import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../../constants/limits";
import { getRemainingDaily } from "../../utils/storage";
import { signalsRemainingLabel } from "../../utils/signalLimits";

type DiscoverLimitsBarProps = {
  isPremium: boolean;
};

export function DiscoverLimitsBar({ isPremium }: DiscoverLimitsBarProps) {
  if (isPremium) return null;

  const remaining = getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES);
  const used = FREE_DAILY_SWIPES - remaining;
  const pct = (used / FREE_DAILY_SWIPES) * 100;
  const label = signalsRemainingLabel(false);

  return (
    <div className="discover-limits" aria-label="Daily signals remaining">
      <div className="discover-limits__head">
        <span>Free Signals today</span>
        <strong>{label || "None left"}</strong>
      </div>
      <div className="discover-limits__track">
        <div className="discover-limits__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
