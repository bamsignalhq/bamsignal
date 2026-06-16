import { FREE_DAILY_SWIPES } from "../../constants/limits";
import { getFreeSignalsRemaining } from "../../utils/signalLimits";

type HomeSignalLimitBarProps = {
  isPremium: boolean;
  onUpgrade: () => void;
  refreshKey?: number;
};

export function HomeSignalLimitBar({ isPremium, onUpgrade, refreshKey = 0 }: HomeSignalLimitBarProps) {
  void refreshKey;
  const remaining = getFreeSignalsRemaining(isPremium);
  const atLimit = !isPremium && remaining <= 0;

  if (isPremium) {
    return (
      <span className="home-signal-pill home-signal-pill--premium" aria-label="Unlimited signals">
        Unlimited Signals
      </span>
    );
  }

  return (
    <button
      type="button"
      className={`home-signal-pill ${atLimit ? "home-signal-pill--full" : ""}`}
      onClick={atLimit ? onUpgrade : undefined}
      aria-label={`${remaining} of ${FREE_DAILY_SWIPES} signals left today`}
    >
      {remaining}/{FREE_DAILY_SWIPES} Signals
    </button>
  );
}
