import {
  QUALITY_REVIEW_TYPE_LABELS,
  QUALITY_REVIEW_TYPES
} from "../../../constants/consultantQuality";
import type { QualityFilterState, QualityReviewRecord } from "../../../types/consultantQuality";
import type { QualityReviewTypeId } from "../../../constants/consultantQuality";
import { QualityReviewCard } from "./QualityReviewCard";

type ReviewHistoryCardProps = {
  reviews: QualityReviewRecord[];
  filters: QualityFilterState;
  selectedReviewId: string | null;
  onFilterChange: (filters: QualityFilterState) => void;
  onSelectReview: (reviewId: string) => void;
  onReset: () => void;
};

export function ReviewHistoryCard({
  reviews,
  filters,
  selectedReviewId,
  onFilterChange,
  onSelectReview,
  onReset
}: ReviewHistoryCardProps) {
  return (
    <section className="quality-card review-history-card concierge-consultant-card--glass cc-reveal">
      <header className="review-history-card__head">
        <h3>Review history</h3>
        <p>Self, peer, manager, and executive reviews — immutable records with append-only logs.</p>
      </header>

      <div className="review-history-card__filters">
        <label className="quality-search-field">
          <span>Search</span>
          <input
            type="search"
            value={filters.query}
            placeholder="Consultant, journey, reviewer…"
            onChange={(event) => onFilterChange({ ...filters, query: event.target.value })}
          />
        </label>

        <label className="quality-search-field">
          <span>Review type</span>
          <select
            value={filters.reviewType}
            onChange={(event) =>
              onFilterChange({
                ...filters,
                reviewType: event.target.value as QualityReviewTypeId | "all"
              })
            }
          >
            <option value="all">All types</option>
            {QUALITY_REVIEW_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="concierge-consultant-btn" onClick={onReset}>
          Reset
        </button>
      </div>

      {reviews.length ? (
        <div className="review-history-card__list">
          {reviews.map((review) => (
            <div key={review.id} className="review-history-card__item">
              <span className="review-history-card__type">
                {QUALITY_REVIEW_TYPE_LABELS[review.reviewType]}
              </span>
              <QualityReviewCard
                review={review}
                selected={selectedReviewId === review.id}
                onSelect={() => onSelectReview(review.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="review-history-card__empty">No reviews match the current filters.</p>
      )}
    </section>
  );
}
