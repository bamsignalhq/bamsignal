import { CONSULTATION_REVIEW_ID_LABEL } from "../../../constants/consultationReview";
import type { ConsultationReviewSummary } from "../../../types/consultationReview";

type ConsultationSummaryCardProps = {
  summary: ConsultationReviewSummary;
};

export function ConsultationSummaryCard({ summary }: ConsultationSummaryCardProps) {
  return (
    <section className="consultation-summary-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Consultation review summary</h3>
        <p>{summary.narrative}</p>
      </header>
      <dl className="consultation-summary-card__grid">
        <div>
          <dt>{CONSULTATION_REVIEW_ID_LABEL}</dt>
          <dd>{summary.reviewId}</dd>
        </div>
        <div>
          <dt>Outcome</dt>
          <dd>{summary.outcomeLabel}</dd>
        </div>
        <div>
          <dt>Recommendation</dt>
          <dd>{summary.recommendationLabel}</dd>
        </div>
        <div>
          <dt>Steward</dt>
          <dd>{summary.consultantName}</dd>
        </div>
        <div>
          <dt>Held</dt>
          <dd>
            <time dateTime={summary.heldAt}>{new Date(summary.heldAt).toLocaleString()}</time>
          </dd>
        </div>
      </dl>
    </section>
  );
}
