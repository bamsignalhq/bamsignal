import { useMemo } from "react";
import { MONETIZATION_COPY } from "../../constants/copy";
import { getFreeSignalsRemaining } from "../../utils/signalLimits";

type HomeSignalLimitBarProps = {
  isPremium: boolean;
  onUpgrade: () => void;
  refreshKey?: number;
};

export function HomeSignalLimitBar({ isPremium, onUpgrade, refreshKey = 0 }: HomeSignalLimitBarProps) {
  const remaining = useMemo(
    () => getFreeSignalsRemaining(isPremium),
    [isPremium, refreshKey]
  );
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

  const label = `${remaining} Signal${remaining === 1 ? "" : "s"} left`;

  return (
    <span className="home-signal-pill" aria-label={label}>
      {label}
    </span>
  );
}
