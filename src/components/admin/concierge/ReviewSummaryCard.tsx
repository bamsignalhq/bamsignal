import { ReviewCategoryCard } from "./ReviewCategoryCard";
import type { ConsultantPerformanceReview } from "../../../types/consultantPerformanceReviews";

type ReviewSummaryCardProps = {
  review: ConsultantPerformanceReview;
};

export function ReviewSummaryCard({ review }: ReviewSummaryCardProps) {
  return (
    <section className="review-summary-card concierge-consultant-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Review Categories</h3>
        <p>Six stewardship dimensions — relationship outcomes over revenue.</p>
      </header>
      <div className="review-summary-card__grid">
        {review.categories.map((category) => (
          <ReviewCategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
