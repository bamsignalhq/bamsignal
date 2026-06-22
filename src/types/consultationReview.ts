export type ConsultationOutcome =
  | "approved"
  | "requires-review"
  | "not-a-fit-yet"
  | "follow-up-required"
  | "paused";

export type ConsultationRecommendationType =
  | "proceed-to-application"
  | "proceed-to-introductions"
  | "additional-consultation"
  | "relationship-coaching"
  | "pause-journey";

export type ConsultationNotesSectionId =
  | "relationship-goals"
  | "values"
  | "lifestyle"
  | "faith"
  | "family-vision"
  | "compatibility-observations"
  | "consultant-observations"
  | "recommendations";

export type ConsultationNotesSections = Record<ConsultationNotesSectionId, string>;

export type ConsultationReviewTimelineKind =
  | "consultation-completed"
  | "review-created"
  | "recommendation-issued"
  | "approval-granted"
  | "follow-up-required";

export type ConsultationReviewTimelineEntry = {
  id: string;
  kind: ConsultationReviewTimelineKind;
  label: string;
  detail?: string;
  at: string;
};

export type ConsultationRecommendation = {
  id: string;
  type: ConsultationRecommendationType;
  label: string;
  detail: string;
  issuedAt: string;
  issuedBy?: string;
};

export type ConsultationReview = {
  id: string;
  reviewId: string;
  memberId: string;
  journeyId?: string;
  memberName: string;
  consultantId: string;
  consultantName: string;
  consultationEventId?: string;
  meetingNoteId?: string;
  heldAt: string;
  outcome: ConsultationOutcome;
  notes: ConsultationNotesSections;
  recommendation: ConsultationRecommendation;
  timeline: ConsultationReviewTimelineEntry[];
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export type ConsultationReviewSummary = {
  reviewId: string;
  memberId: string;
  memberName: string;
  journeyId?: string;
  outcome: ConsultationOutcome;
  outcomeLabel: string;
  recommendationType: ConsultationRecommendationType;
  recommendationLabel: string;
  consultantName: string;
  heldAt: string;
  narrative: string;
};

export type MemberConsultationReviewBundle = {
  summary: ConsultationReviewSummary | null;
  reviews: ConsultationReview[];
  timeline: ConsultationReviewTimelineEntry[];
};

/** Reserved — not implemented. */
export type ConsultationReviewFutureCapability =
  | "multi-reviewer-signoff"
  | "ai-note-drafting"
  | "recording-transcripts";

export type ConsultationReviewFutureConfig = {
  capability?: ConsultationReviewFutureCapability;
  enabled?: boolean;
};
