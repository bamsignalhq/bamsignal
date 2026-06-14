import { FREE_DAILY_SWIPES, STORAGE_KEYS } from "../../constants/limits";
import { getRemainingDaily } from "../../utils/storage";

type DiscoverLimitsBarProps = {
  isPremium: boolean;
};

export function DiscoverLimitsBar({ isPremium }: DiscoverLimitsBarProps) {
  if (isPremium) return null;

  const remaining = getRemainingDaily(STORAGE_KEYS.dailySwipes, FREE_DAILY_SWIPES);
  const used = FREE_DAILY_SWIPES - remaining;
  const pct = (used / FREE_DAILY_SWIPES) * 100;

  return (
    <div className="discover-limits" aria-label="Daily signals remaining">
      <div className="discover-limits__head">
        <span>Signals Remaining</span>
        <strong>
          {remaining} / {FREE_DAILY_SWIPES}
        </strong>
      </div>
      <div className="discover-limits__track">
        <div className="discover-limits__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
