/** Consultant Quality Assurance™ — independent quality review framework. */

export const CONSULTANT_QUALITY_BRAND = "Consultant Quality Assurance™";

export const QUALITY_APPEND_ONLY_RULES = [
  "Quality reviews never modify original records.",
  "Reviews append only."
] as const;

export type QualityReviewAreaId =
  | "consultation-quality"
  | "meeting-notes"
  | "recommendations"
  | "introductions"
  | "follow-up-quality"
  | "documentation-quality"
  | "member-satisfaction"
  | "professional-conduct";

export type QualityRatingId =
  | "excellent"
  | "strong"
  | "good"
  | "needs-improvement"
  | "requires-review";

export type QualityMetricId =
  | "reviews-completed"
  | "average-quality-score"
  | "areas-needing-improvement"
  | "training-recommendations";

export const QUALITY_REVIEW_AREAS: {
  id: QualityReviewAreaId;
  label: string;
}[] = [
  { id: "consultation-quality", label: "Consultation quality" },
  { id: "meeting-notes", label: "Meeting notes" },
  { id: "recommendations", label: "Recommendations" },
  { id: "introductions", label: "Introductions" },
  { id: "follow-up-quality", label: "Follow-up quality" },
  { id: "documentation-quality", label: "Documentation quality" },
  { id: "member-satisfaction", label: "Member satisfaction" },
  { id: "professional-conduct", label: "Professional conduct" }
];

export const QUALITY_REVIEW_AREA_LABELS: Record<QualityReviewAreaId, string> = Object.fromEntries(
  QUALITY_REVIEW_AREAS.map((item) => [item.id, item.label])
) as Record<QualityReviewAreaId, string>;

export const QUALITY_RATINGS: {
  id: QualityRatingId;
  label: string;
  score: number;
}[] = [
  { id: "excellent", label: "Excellent", score: 100 },
  { id: "strong", label: "Strong", score: 85 },
  { id: "good", label: "Good", score: 70 },
  { id: "needs-improvement", label: "Needs Improvement", score: 50 },
  { id: "requires-review", label: "Requires Review", score: 30 }
];

export const QUALITY_RATING_LABELS: Record<QualityRatingId, string> = Object.fromEntries(
  QUALITY_RATINGS.map((item) => [item.id, item.label])
) as Record<QualityRatingId, string>;

export const QUALITY_RATING_SCORES: Record<QualityRatingId, number> = Object.fromEntries(
  QUALITY_RATINGS.map((item) => [item.id, item.score])
) as Record<QualityRatingId, number>;

export const QUALITY_METRICS: {
  id: QualityMetricId;
  label: string;
}[] = [
  { id: "reviews-completed", label: "Reviews completed" },
  { id: "average-quality-score", label: "Average quality score" },
  { id: "areas-needing-improvement", label: "Areas needing improvement" },
  { id: "training-recommendations", label: "Training recommendations" }
];

/**
 * Future-ready quality capabilities — documented only, not implemented.
 */
export const CONSULTANT_QUALITY_FUTURE_KINDS = [
  { id: "call-recordings", label: "Call recordings" },
  { id: "transcript-review", label: "Transcript review" },
  { id: "ai-quality-analysis", label: "AI quality analysis" }
] as const;

export const CONSULTATION_AUDIT_AREAS: QualityReviewAreaId[] = [
  "consultation-quality",
  "meeting-notes",
  "member-satisfaction"
];

export const INTRODUCTION_AUDIT_AREAS: QualityReviewAreaId[] = [
  "introductions",
  "follow-up-quality",
  "recommendations"
];

export const DOCUMENTATION_AUDIT_AREAS: QualityReviewAreaId[] = [
  "documentation-quality",
  "professional-conduct"
];
