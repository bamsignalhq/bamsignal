import type { PerformanceReviewAchievementEvent } from "../../../types/consultantPerformanceReviews";

type AchievementTimelineCardProps = {
  achievements: PerformanceReviewAchievementEvent[];
};

export function AchievementTimelineCard({ achievements }: AchievementTimelineCardProps) {
  const earned = achievements.filter((item) => item.earned);
  const timeline = [...earned].sort((left, right) => {
    const leftTime = left.earnedAt ? new Date(left.earnedAt).getTime() : 0;
    const rightTime = right.earnedAt ? new Date(right.earnedAt).getTime() : 0;
    return rightTime - leftTime;
  });

  return (
    <section className="achievement-timeline-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Achievement Timeline</h3>
        <p>
          {earned.length} of {achievements.length} milestones earned — celebrating journey success.
        </p>
      </header>
      {timeline.length === 0 ? (
        <p className="concierge-consultant__empty">Achievements will appear as journey outcomes grow.</p>
      ) : (
        <ol className="achievement-timeline-card__list">
          {timeline.map((achievement) => (
            <li key={achievement.id}>
              <div className="achievement-timeline-card__marker" aria-hidden />
              <div>
                <strong>{achievement.label}</strong>
                {achievement.earnedAt ? (
                  <time dateTime={achievement.earnedAt}>
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </time>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
      <ul className="achievement-timeline-card__progress">
        {achievements
          .filter((item) => !item.earned)
          .map((achievement) => (
            <li key={achievement.id}>
              <span>{achievement.label}</span>
              <em>
                {achievement.progress} / {achievement.target}
              </em>
            </li>
          ))}
      </ul>
    </section>
  );
}
