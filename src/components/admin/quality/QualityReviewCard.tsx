import { QUALITY_REVIEW_AREA_LABELS, QUALITY_RATING_LABELS } from "../../../constants/consultantQuality";
import type { QualityReviewRecord } from "../../../types/consultantQuality";

type QualityReviewCardProps = {
  review: QualityReviewRecord;
  selected?: boolean;
  onSelect?: () => void;
};

export function QualityReviewCard({ review, selected = false, onSelect }: QualityReviewCardProps) {
  const content = (
    <>
      <div className="quality-review-card__head">
        <p className="quality-review-card__ref">{review.reviewRef}</p>
        <span className="quality-review-card__score">{review.overallScore}%</span>
      </div>
      <h3>{review.consultantName}</h3>
      <p>{review.summary}</p>
      <dl className="quality-review-card__meta">
        <div>
          <dt>Reviewer</dt>
          <dd>{review.reviewer}</dd>
        </div>
        <div>
          <dt>Journey</dt>
          <dd>{review.journeyRef}</dd>
        </div>
        <div>
          <dt>Reviewed</dt>
          <dd>{new Date(review.reviewedAt).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt>Areas</dt>
          <dd>{review.areaRatings.length} rated</dd>
        </div>
      </dl>
      <ul className="quality-review-card__areas">
        {review.areaRatings.map((area) => (
          <li key={area.areaId}>
            {QUALITY_REVIEW_AREA_LABELS[area.areaId]}: {QUALITY_RATING_LABELS[area.rating]}
          </li>
        ))}
      </ul>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        className={`quality-review-card quality-review-card--button${selected ? " is-selected" : ""}`}
        onClick={onSelect}
      >
        {content}
      </button>
    );
  }

  return <article className="quality-review-card">{content}</article>;
}
