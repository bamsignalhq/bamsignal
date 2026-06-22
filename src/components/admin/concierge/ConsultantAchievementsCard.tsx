import {
  CONSULTANT_ACHIEVEMENTS_TITLE,
  CONSULTANT_FUTURE_RANKINGS
} from "../../../constants/consultantPerformanceScorecard";
import type { ConsultantAchievement } from "../../../types/consultantPerformanceScorecard";

type ConsultantAchievementsCardProps = {
  achievements: ConsultantAchievement[];
};

export function ConsultantAchievementsCard({ achievements }: ConsultantAchievementsCardProps) {
  const earned = achievements.filter((item) => item.earned);

  return (
    <section className="consultant-achievements-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="consultant-achievements-card__head">
        <h3>{CONSULTANT_ACHIEVEMENTS_TITLE}</h3>
        <p>
          {earned.length} of {achievements.length} earned — celebrating journey success.
        </p>
      </header>

      <ul className="consultant-achievements-card__list">
        {achievements.map((achievement) => {
          const progressPct = Math.min(100, Math.round((achievement.progress / achievement.target) * 100));
          return (
            <li
              key={achievement.id}
              className={`consultant-achievements-card__item${
                achievement.earned ? " consultant-achievements-card__item--earned" : ""
              }`}
            >
              <div className="consultant-achievements-card__label-row">
                <span>{achievement.label}</span>
                {achievement.earned ? <span className="consultant-achievements-card__badge">Earned</span> : null}
              </div>
              <div className="consultant-achievements-card__bar" aria-hidden>
                <span style={{ width: `${progressPct}%` }} />
              </div>
              <span className="consultant-achievements-card__progress">
                {achievement.progress} / {achievement.target}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="consultant-achievements-card__future">
        Reserved:{" "}
        {CONSULTANT_FUTURE_RANKINGS.map((item: { label: string }) => item.label).join(" · ")} — permissions not implemented.
      </p>
    </section>
  );
}
