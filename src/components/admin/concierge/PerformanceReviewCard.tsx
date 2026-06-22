import { PERFORMANCE_REVIEW_RATING_LABELS } from "../../../constants/consultantPerformanceReviews";
import type { ConsultantPerformanceReview } from "../../../types/consultantPerformanceReviews";

type PerformanceReviewCardProps = {
  review: ConsultantPerformanceReview;
};

export function PerformanceReviewCard({ review }: PerformanceReviewCardProps) {
  return (
    <section className="performance-review-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>{review.periodLabel} Review</h3>
        <p>Human-first stewardship review — not a sales scorecard.</p>
      </header>
      <div className="performance-review-card__body">
        <div className="performance-review-card__rating">
          <span>Overall</span>
          <strong className={`performance-review-card__rating--${review.overallRating}`}>
            {review.overallRatingLabel}
          </strong>
        </div>
        <time className="performance-review-card__date" dateTime={review.reviewedAt}>
          Reviewed {new Date(review.reviewedAt).toLocaleString()}
        </time>
        <p>{review.summary}</p>
        <dl className="performance-review-card__meta">
          <div>
            <dt>Consultant</dt>
            <dd>{review.consultantName}</dd>
          </div>
          <div>
            <dt>Period</dt>
            <dd>{review.periodLabel}</dd>
          </div>
          <div>
            <dt>Rating scale</dt>
            <dd>{Object.values(PERFORMANCE_REVIEW_RATING_LABELS).join(" · ")}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
