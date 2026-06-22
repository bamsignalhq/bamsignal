import {
  APPLICATION_APPROVAL_ENGINE_BRAND,
  APPLICATION_REVIEW_ID_LABEL
} from "../../../constants/applicationApproval";
import type { ApplicationReview } from "../../../types/applicationApproval";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";

type ApplicationReviewCardProps = {
  review: ApplicationReview;
};

export function ApplicationReviewCard({ review }: ApplicationReviewCardProps) {
  return (
    <section className="application-review-card concierge-consultant-card--glass cc-reveal">
      <header className="concierge-consultant-card__head">
        <h3>Application review</h3>
        <p>{APPLICATION_APPROVAL_ENGINE_BRAND}</p>
      </header>
      <div className="application-review-card__status-row">
        <ApprovalStatusBadge status={review.status} />
        <span className="application-review-card__human">Human-led review</span>
      </div>
      <dl className="application-review-card__grid">
        <div>
          <dt>{APPLICATION_REVIEW_ID_LABEL}</dt>
          <dd className="application-review-card__id">{review.reviewId}</dd>
        </div>
        <div>
          <dt>Assigned reviewer</dt>
          <dd>{review.assignedReviewerName ?? "Awaiting steward assignment"}</dd>
        </div>
        <div>
          <dt>Member</dt>
          <dd>{review.memberName}</dd>
        </div>
        {review.journeyId ? (
          <div>
            <dt>Journey ID</dt>
            <dd className="application-review-card__journey-id">{review.journeyId}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
