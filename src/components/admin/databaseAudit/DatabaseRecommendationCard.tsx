import type { DatabaseRecommendation } from "../../../types/databaseAudit";

type DatabaseRecommendationCardProps = {
  recommendations: DatabaseRecommendation[];
};

export function DatabaseRecommendationCard({ recommendations }: DatabaseRecommendationCardProps) {
  return (
    <section className="database-recommendation-card concierge-consultant-card--glass cc-reveal">
      <header className="database-recommendation-card__head">
        <h3>Recommendations</h3>
        <p>Schema verification, cutover, and consolidation actions — no assumptions.</p>
      </header>

      <ul className="database-recommendation-card__list">
        {recommendations.map((item) => (
          <li key={item.id}>
            <div className="database-recommendation-card__item-head">
              <strong>{item.title}</strong>
              <span className={`database-recommendation-card__priority database-recommendation-card__priority--${item.priority}`}>
                {item.priority}
              </span>
            </div>
            <p>{item.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
