import { FREE_DAILY_SWIPES } from "../../constants/limits";
import {
  getFreeSignalsRemaining,
  signalLimitReachedMessage,
  signalsLeftTodayDisplay
} from "../../utils/signalLimits";

type HomeSignalLimitBarProps = {
  isPremium: boolean;
  onUpgrade: () => void;
  refreshKey?: number;
};

export function HomeSignalLimitBar({ isPremium, onUpgrade, refreshKey = 0 }: HomeSignalLimitBarProps) {
  void refreshKey;
  const display = signalsLeftTodayDisplay(isPremium);
  const remaining = getFreeSignalsRemaining(isPremium);
  const atLimit = !isPremium && remaining <= 0;

  return (
    <section className={`home-signal-limit card ${atLimit ? "home-signal-limit--full" : ""}`} aria-label="Signals left today">
      <div className="home-signal-limit__row">
        <span className="home-signal-limit__label">Signals Left Today</span>
        <strong className="home-signal-limit__count">{display}</strong>
      </div>
      {atLimit ? (
        <div className="home-signal-limit__upgrade">
          <p>{signalLimitReachedMessage()}</p>
          <button type="button" className="btn-primary btn-sm" onClick={onUpgrade}>
            Get Signal Pass
          </button>
        </div>
      ) : !isPremium ? (
        <p className="home-signal-limit__hint">{remaining} of {FREE_DAILY_SWIPES} free Signals remaining</p>
      ) : (
        <p className="home-signal-limit__hint">Unlimited Signals with Signal Pass</p>
      )}
    </section>
  );
}
