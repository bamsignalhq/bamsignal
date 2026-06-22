import type { PerformanceReviewCategoryScore } from "../../../types/consultantPerformanceReviews";

type ReviewCategoryCardProps = {
  category: PerformanceReviewCategoryScore;
};

export function ReviewCategoryCard({ category }: ReviewCategoryCardProps) {
  return (
    <article className={`review-category-card review-category-card--${category.rating}`}>
      <header className="review-category-card__head">
        <h4>{category.label}</h4>
        <span>{category.ratingLabel}</span>
      </header>
      <p>{category.narrative}</p>
      <ul className="review-category-card__evidence">
        {category.evidence.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
