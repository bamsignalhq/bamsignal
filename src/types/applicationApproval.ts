export type ApplicationApprovalStatus =
  | "submitted"
  | "under-review"
  | "additional-information"
  | "approved"
  | "declined"
  | "withdrawn";

export type ReviewTimelineKind =
  | "application-submitted"
  | "review-started"
  | "consultant-recommendation"
  | "decision";

export type ReviewTimelineEntry = {
  id: string;
  kind: ReviewTimelineKind;
  label: string;
  detail?: string;
  at: string;
};

export type ApprovalDecision = {
  status: ApplicationApprovalStatus;
  label: string;
  detail: string;
  decidedAt?: string;
  decidedBy?: string;
};

export type ReviewerRecommendation = {
  id: string;
  reviewerId: string;
  reviewerName: string;
  recommendation: string;
  recordedAt: string;
};

export type ApplicationReview = {
  id: string;
  reviewId: string;
  memberId: string;
  journeyId?: string;
  memberName: string;
  status: ApplicationApprovalStatus;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  timeline: ReviewTimelineEntry[];
  recommendation?: ReviewerRecommendation;
  decision: ApprovalDecision;
  createdAt: string;
  updatedAt: string;
};

export type ReviewSummary = {
  reviewId: string;
  memberId: string;
  memberName: string;
  journeyId?: string;
  status: ApplicationApprovalStatus;
  statusLabel: string;
  assignedReviewerName?: string;
  recommendationPreview?: string;
  decisionLabel: string;
  narrative: string;
};

/** Reserved — not implemented. */
export type ApplicationApprovalFutureCapability =
  | "compatibility-specialists"
  | "multiple-reviewers"
  | "family-advisors"
  | "ai-assistance";

export type ApplicationApprovalFutureConfig = {
  capability?: ApplicationApprovalFutureCapability;
  enabled?: boolean;
};

export type MemberApplicationApprovalBundle = {
  review: ApplicationReview;
  summary: ReviewSummary;
};
