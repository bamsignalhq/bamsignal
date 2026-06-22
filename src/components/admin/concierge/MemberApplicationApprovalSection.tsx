import { useMemo } from "react";
import { APPLICATION_APPROVAL_ENGINE_BRAND } from "../../../constants/applicationApproval";
import type { ConciergeMemberRecord } from "../../../types/conciergeConsultant";
import { ensureMemberApplicationApprovalBundle } from "../../../utils/ApplicationApprovalEngine";
import { ApplicationReviewCard } from "./ApplicationReviewCard";
import { ApprovalStatusBadge } from "./ApprovalStatusBadge";
import { ApprovalTimelineCard } from "./ApprovalTimelineCard";
import { DecisionSummaryCard } from "./DecisionSummaryCard";
import { ReviewerRecommendationCard } from "./ReviewerRecommendationCard";

type MemberApplicationApprovalSectionProps = {
  member: ConciergeMemberRecord;
};

export function MemberApplicationApprovalSection({ member }: MemberApplicationApprovalSectionProps) {
  const bundle = useMemo(() => ensureMemberApplicationApprovalBundle(member), [member]);

  return (
    <section className="member-application-approval">
      <header className="member-application-approval__section-head cc-reveal">
        <h2>Application approval</h2>
        <p>{APPLICATION_APPROVAL_ENGINE_BRAND} — human review before introductions.</p>
      </header>

      <div className="member-application-approval__overview concierge-consultant-card concierge-consultant-card--glass cc-reveal">
        <dl className="member-application-approval__grid">
          <div>
            <dt>Approval status</dt>
            <dd>
              <ApprovalStatusBadge status={bundle.summary.status} />
            </dd>
          </div>
          <div>
            <dt>Assigned reviewer</dt>
            <dd>{bundle.summary.assignedReviewerName ?? "Awaiting steward assignment"}</dd>
          </div>
          <div>
            <dt>Recommendation</dt>
            <dd>{bundle.summary.recommendationPreview ?? "Pending"}</dd>
          </div>
          <div>
            <dt>Decision</dt>
            <dd>{bundle.summary.decisionLabel}</dd>
          </div>
        </dl>
        <p className="member-application-approval__narrative">{bundle.summary.narrative}</p>
      </div>

      <div className="member-application-approval__cards">
        <ApplicationReviewCard review={bundle.review} />
        <ReviewerRecommendationCard recommendation={bundle.review.recommendation} />
        <DecisionSummaryCard decision={bundle.review.decision} />
        <ApprovalTimelineCard timeline={bundle.review.timeline} />
      </div>
    </section>
  );
}
