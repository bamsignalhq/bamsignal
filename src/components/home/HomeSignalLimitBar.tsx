import { FREE_DAILY_SWIPES } from "../../constants/limits";
import {
  getFreeSignalsRemaining,
  signalLimitReachedMessage
} from "../../utils/signalLimits";

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
      <div className="home-signal-meter home-signal-meter--premium" aria-label="Signals">
        <span className="home-signal-meter__value">Unlimited</span>
      </div>
    );
  }

  return (
    <div
      className={`home-signal-meter ${atLimit ? "home-signal-meter--full" : ""}`}
      aria-label={`${remaining} of ${FREE_DAILY_SWIPES} signals left today`}
    >
      <div className="home-signal-meter__dots" aria-hidden>
        {Array.from({ length: FREE_DAILY_SWIPES }).map((_, i) => (
          <span key={i} className={i < remaining ? "on" : ""} />
        ))}
      </div>
      <span className="home-signal-meter__value">
        {remaining}/{FREE_DAILY_SWIPES}
      </span>
      {atLimit ? (
        <button type="button" className="home-signal-meter__upgrade" onClick={onUpgrade}>
          Upgrade
        </button>
      ) : null}
      {atLimit ? (
        <p className="home-signal-meter__message">{signalLimitReachedMessage()}</p>
      ) : null}
    </div>
  );
}
