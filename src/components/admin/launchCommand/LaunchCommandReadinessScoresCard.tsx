import type { LaunchReadinessScore } from "../../../types/launchCommandCenter";

type LaunchCommandReadinessScoresCardProps = {
  scores: LaunchReadinessScore[];
};

export function LaunchCommandReadinessScoresCard({ scores }: LaunchCommandReadinessScoresCardProps) {
  return (
    <section className="launch-command-card launch-command-scores-card concierge-consultant-card--glass cc-reveal">
      <header className="launch-command-card__head">
        <h3>Readiness score</h3>
        <p>Overall and domain scores for 100,000 member launch capacity.</p>
      </header>
      <div className="launch-command-scores-card__grid">
        {scores.map((score) => (
          <article key={score.id} className={`launch-command-score launch-command-score--${score.status}`}>
            <span>{score.label}</span>
            <strong>{score.score}%</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
