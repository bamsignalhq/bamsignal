import type { JourneyRepairRecommendation } from "../../../types/journeyIntegrityAudit";

type JourneyRepairRecommendationCardProps = {
  recommendations: JourneyRepairRecommendation[];
};

export function JourneyRepairRecommendationCard({
  recommendations
}: JourneyRepairRecommendationCardProps) {
  return (
    <section className="journey-repair-card concierge-consultant-card--glass cc-reveal">
      <header className="journey-repair-card__head">
        <h3>Repair recommendations</h3>
        <p>Prioritized actions to restore journey ID backbone integrity.</p>
      </header>

      <div className="journey-repair-card__list">
        {recommendations.map((recommendation) => (
          <article
            key={recommendation.id}
            className={`journey-repair-card__row journey-repair-card__row--${recommendation.priority}`}
          >
            <div>
              <strong>{recommendation.title}</strong>
              <p>{recommendation.summary}</p>
              {recommendation.journeyId ? <small>Journey: {recommendation.journeyId}</small> : null}
            </div>
            <span className={`journey-repair-card__priority journey-repair-card__priority--${recommendation.priority}`}>
              {recommendation.priority}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
