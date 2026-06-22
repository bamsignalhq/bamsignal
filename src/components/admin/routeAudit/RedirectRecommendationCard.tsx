import type { RedirectRecommendation } from "../../../types/routeAudit";

type RedirectRecommendationCardProps = {
  recommendations: RedirectRecommendation[];
};

export function RedirectRecommendationCard({ recommendations }: RedirectRecommendationCardProps) {
  return (
    <section className="redirect-recommendation-card concierge-consultant-card--glass cc-reveal">
      <header className="redirect-recommendation-card__head">
        <h3>Redirect opportunities</h3>
        <p>Legacy aliases and console roots that should canonicalize to stable paths.</p>
      </header>

      {recommendations.length ? (
        <ul className="redirect-recommendation-card__list">
          {recommendations.map((item) => (
            <li key={item.id}>
              <div className="redirect-recommendation-card__paths">
                <code>{item.fromPath}</code>
                <span>→</span>
                <code>{item.toPath}</code>
              </div>
              <p>
                {item.reason}
                <span className={`redirect-recommendation-card__priority redirect-recommendation-card__priority--${item.priority}`}>
                  {item.priority}
                </span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="redirect-recommendation-card__empty">No redirect recommendations at this time.</p>
      )}
    </section>
  );
}
