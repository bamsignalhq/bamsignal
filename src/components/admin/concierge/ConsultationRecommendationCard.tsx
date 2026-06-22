import type { ConsultationRecommendation } from "../../../types/consultationReview";

type ConsultationRecommendationCardProps = {
  recommendation: ConsultationRecommendation;
};

export function ConsultationRecommendationCard({ recommendation }: ConsultationRecommendationCardProps) {
  return (
    <section className="consultation-recommendation-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Steward recommendation</h3>
        <p>Formal next-step recommendation issued after consultation review.</p>
      </header>
      <div className="consultation-recommendation-card__label">
        <strong>{recommendation.label}</strong>
        {recommendation.issuedBy ? <span>Issued by {recommendation.issuedBy}</span> : null}
      </div>
      <p className="consultation-recommendation-card__detail">{recommendation.detail}</p>
      <time dateTime={recommendation.issuedAt} className="consultation-recommendation-card__time">
        {new Date(recommendation.issuedAt).toLocaleString()}
      </time>
    </section>
  );
}
