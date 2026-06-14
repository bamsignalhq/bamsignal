import { getStreak, getStreakLabel } from "../../utils/streaks";

export function StreakBanner() {
  const streak = getStreak();
  if (streak.count < 1) return null;

  const label = getStreakLabel(streak.count);
  const sub =
    streak.count >= 30
      ? "You're building serious momentum."
      : streak.count >= 7
        ? "Keep showing up — consistency wins."
        : "You're building momentum.";

  return (
    <section className="dash-streak card dash-animate" aria-label="Activity streak">
      <p className="dash-streak__label">{label}</p>
      <p className="dash-streak__sub">{sub}</p>
      {streak.longest > streak.count && (
        <span className="dash-streak__best">Best: {streak.longest} days</span>
      )}
    </section>
  );
}
