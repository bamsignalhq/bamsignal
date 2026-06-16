import { FREE_DAILY_SWIPES } from "../../constants/limits";
import { MONETIZATION_COPY } from "../../constants/copy";
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

  if (atLimit) {
    return (
      <button
        type="button"
        className="home-signal-pill home-signal-pill--full"
        onClick={onUpgrade}
        aria-label={MONETIZATION_COPY.signalsExhaustedTitle}
      >
        {MONETIZATION_COPY.signalsExhaustedTitle}
      </button>
    );
  }

  return (
    <span className="home-signal-pill" aria-label={`${remaining} signals available today`}>
      {remaining} Signal{remaining === 1 ? "" : "s"} available today
    </span>
  );
}
