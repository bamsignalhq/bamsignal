import {
  WORKFORCE_CAPACITY_STATE_LABELS,
  WORKFORCE_MATCH_FACTOR_LABELS,
  WORKFORCE_ROLE_LABELS
} from "../../../constants/workforceManagement";
import type { WorkforceRecommendation } from "../../../types/workforceManagement";

type AssignmentRecommendationCardProps = {
  recommendations: WorkforceRecommendation[];
};

export function AssignmentRecommendationCard({ recommendations }: AssignmentRecommendationCardProps) {
  return (
    <section className="workforce-card assignment-recommendation-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Assignment recommendations</h3>
        <p>Suggestions only — admin always makes the final assignment decision.</p>
      </header>
      {recommendations.length === 0 ? (
        <p className="concierge-consultant__empty">No recommendations for current criteria.</p>
      ) : (
        <ul className="assignment-recommendation-card__list">
          {recommendations.map((item) => (
            <li key={item.profileId}>
              <div className="assignment-recommendation-card__headline">
                <strong>{item.displayName}</strong>
                <span className="workforce-pill">{item.score}/100</span>
              </div>
              <p>
                {WORKFORCE_ROLE_LABELS[item.roleId]} ·{" "}
                {WORKFORCE_CAPACITY_STATE_LABELS[item.capacityState]}
              </p>
              <p className="assignment-recommendation-card__narrative">{item.narrative}</p>
              {item.matchFactors.length > 0 ? (
                <ul className="assignment-recommendation-card__factors">
                  {item.matchFactors.map((factor) => (
                    <li key={factor}>{WORKFORCE_MATCH_FACTOR_LABELS[factor]}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
