import {
  CONSULTATION_REVIEW_ID_LABEL,
  CONSULTATION_REVIEW_TIMELINE_LABELS
} from "../../../constants/consultationReview";
import type { ConsultationReview, ConsultationReviewTimelineEntry } from "../../../types/consultationReview";

type ConsultationHistoryCardProps = {
  reviews: ConsultationReview[];
  timeline?: ConsultationReviewTimelineEntry[];
};

export function ConsultationHistoryCard({ reviews, timeline = [] }: ConsultationHistoryCardProps) {
  const events =
    timeline.length > 0
      ? timeline
      : reviews.flatMap((review) => review.timeline).sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return (
    <section className="consultation-history-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultation history</h3>
        <p>Append-only review timeline across completed consultations.</p>
      </header>

      {reviews.length > 0 ? (
        <ul className="consultation-history-card__reviews">
          {reviews.map((review) => (
            <li key={review.id}>
              <strong>{review.memberName}</strong>
              <span>
                {CONSULTATION_REVIEW_ID_LABEL} {review.reviewId}
              </span>
              <time dateTime={review.heldAt}>{new Date(review.heldAt).toLocaleString()}</time>
            </li>
          ))}
        </ul>
      ) : null}

      {events.length === 0 ? (
        <p className="concierge-consultant__empty">No consultation review history yet.</p>
      ) : (
        <ol className="consultation-history-card__timeline">
          {events.map((entry) => (
            <li key={entry.id}>
              <span className="consultation-history-card__dot" aria-hidden />
              <div>
                <strong>{CONSULTATION_REVIEW_TIMELINE_LABELS[entry.kind]}</strong>
                {entry.detail ? <span>{entry.detail}</span> : null}
                <time dateTime={entry.at}>{new Date(entry.at).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
