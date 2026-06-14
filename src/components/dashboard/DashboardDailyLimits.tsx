import { FREE_DAILY_MESSAGES, FREE_DAILY_SWIPES, STORAGE_KEYS } from "../../constants/limits";
import { readDailyCount } from "../../utils/storage";

export function DashboardDailyLimits() {
  const swipesUsed = readDailyCount(STORAGE_KEYS.dailySwipes);
  const messagesUsed = readDailyCount(STORAGE_KEYS.dailyMessages);

  const swipePct = Math.min(100, (swipesUsed / FREE_DAILY_SWIPES) * 100);
  const messagePct = Math.min(100, (messagesUsed / FREE_DAILY_MESSAGES) * 100);

  return (
    <section className="dash-limits card dash-animate">
      <h2 className="dash-limits__title">Today&apos;s Access</h2>
      <div className="dash-limits__row">
        <div className="dash-limits__label">
          <span>Swipes</span>
          <strong>
            {swipesUsed} / {FREE_DAILY_SWIPES}
          </strong>
        </div>
        <div className="dash-limits__track" role="progressbar" aria-valuenow={swipesUsed} aria-valuemin={0} aria-valuemax={FREE_DAILY_SWIPES}>
          <div className="dash-limits__fill" style={{ width: `${swipePct}%` }} />
        </div>
      </div>
      <div className="dash-limits__row">
        <div className="dash-limits__label">
          <span>Messages</span>
          <strong>
            {messagesUsed} / {FREE_DAILY_MESSAGES}
          </strong>
        </div>
        <div className="dash-limits__track" role="progressbar" aria-valuenow={messagesUsed} aria-valuemin={0} aria-valuemax={FREE_DAILY_MESSAGES}>
          <div className="dash-limits__fill dash-limits__fill--messages" style={{ width: `${messagePct}%` }} />
        </div>
      </div>
    </section>
  );
}
