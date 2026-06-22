import type { ReviewerRecommendation } from "../../../types/applicationApproval";

type ReviewerRecommendationCardProps = {
  recommendation?: ReviewerRecommendation;
};

export function ReviewerRecommendationCard({ recommendation }: ReviewerRecommendationCardProps) {
  return (
    <section className="reviewer-recommendation-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Steward recommendation</h3>
        <p>Human recommendation — never algorithmic scoring.</p>
      </header>
      {recommendation ? (
        <>
          <div className="reviewer-recommendation-card__reviewer">
            <span>Reviewer</span>
            <strong>{recommendation.reviewerName}</strong>
          </div>
          <p className="reviewer-recommendation-card__text">{recommendation.recommendation}</p>
          <time dateTime={recommendation.recordedAt}>
            Recorded {new Date(recommendation.recordedAt).toLocaleString()}
          </time>
        </>
      ) : (
        <p className="reviewer-recommendation-card__empty">
          Steward recommendation pending — review in progress.
        </p>
      )}
    </section>
  );
}
