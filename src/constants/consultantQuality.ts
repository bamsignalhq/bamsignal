/** Consultant Quality, Standards & Certification™ — institutional consultant excellence. */

import { CONSULTANT_QUALITY_ADMIN_BRAND } from "./consultantQualityAdmin";

export const CONSULTANT_QUALITY_BRAND = CONSULTANT_QUALITY_ADMIN_BRAND;

export const QUALITY_APPEND_ONLY_RULES = [
  "Quality reviews never modify original records.",
  "Reviews append only.",
  "Every action is audit logged."
] as const;

export type QualityStandardId =
  | "communication"
  | "professionalism"
  | "relationship-guidance"
  | "documentation-quality"
  | "member-satisfaction"
  | "ethics"
  | "follow-up-quality"
  | "journey-stewardship";

/** @deprecated use QualityStandardId */
export type QualityReviewAreaId = QualityStandardId;

export type QualityReviewTypeId =
  | "self-review"
  | "peer-review"
  | "manager-review"
  | "executive-review";

export type CertificationLevelId =
  | "certified"
  | "senior-certified"
  | "master-consultant"
  | "legacy-consultant"
  | "expired"
  | "suspended";

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
  | "training-recommendations"
  | "active-certifications"
  | "open-improvement-plans";

export const QUALITY_STANDARDS: { id: QualityStandardId; label: string }[] = [
  { id: "communication", label: "Communication" },
  { id: "professionalism", label: "Professionalism" },
  { id: "relationship-guidance", label: "Relationship Guidance" },
  { id: "documentation-quality", label: "Documentation Quality" },
  { id: "member-satisfaction", label: "Member Satisfaction" },
  { id: "ethics", label: "Ethics" },
  { id: "follow-up-quality", label: "Follow-up Quality" },
  { id: "journey-stewardship", label: "Journey Stewardship" }
];

export const QUALITY_REVIEW_AREAS = QUALITY_STANDARDS;

export const QUALITY_STANDARD_LABELS: Record<QualityStandardId, string> = Object.fromEntries(
  QUALITY_STANDARDS.map((item) => [item.id, item.label])
) as Record<QualityStandardId, string>;

export const QUALITY_REVIEW_AREA_LABELS = QUALITY_STANDARD_LABELS;

export const QUALITY_REVIEW_TYPES: { id: QualityReviewTypeId; label: string }[] = [
  { id: "self-review", label: "Self Review" },
  { id: "peer-review", label: "Peer Review" },
  { id: "manager-review", label: "Manager Review" },
  { id: "executive-review", label: "Executive Review" }
];

export const QUALITY_REVIEW_TYPE_LABELS: Record<QualityReviewTypeId, string> = Object.fromEntries(
  QUALITY_REVIEW_TYPES.map((item) => [item.id, item.label])
) as Record<QualityReviewTypeId, string>;

export const CERTIFICATION_LEVELS: { id: CertificationLevelId; label: string }[] = [
  { id: "certified", label: "Certified" },
  { id: "senior-certified", label: "Senior Certified" },
  { id: "master-consultant", label: "Master Consultant" },
  { id: "legacy-consultant", label: "Legacy Consultant" },
  { id: "expired", label: "Expired" },
  { id: "suspended", label: "Suspended" }
];

export const CERTIFICATION_LEVEL_LABELS: Record<CertificationLevelId, string> = Object.fromEntries(
  CERTIFICATION_LEVELS.map((item) => [item.id, item.label])
) as Record<CertificationLevelId, string>;

export const QUALITY_RATINGS: { id: QualityRatingId; label: string; score: number }[] = [
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

export const QUALITY_METRICS: { id: QualityMetricId; label: string }[] = [
  { id: "reviews-completed", label: "Reviews completed" },
  { id: "average-quality-score", label: "Average quality score" },
  { id: "areas-needing-improvement", label: "Areas needing improvement" },
  { id: "training-recommendations", label: "Training recommendations" },
  { id: "active-certifications", label: "Active certifications" },
  { id: "open-improvement-plans", label: "Open improvement plans" }
];

export const CONSULTANT_QUALITY_DB_TABLES = [
  "consultant_reviews",
  "consultant_certifications",
  "quality_assessments",
  "consultation_reviews",
  "coaching_sessions",
  "improvement_plans"
] as const;

export const QUALITY_AUDIT_ACTIONS = [
  "review-completed",
  "certification-issued",
  "certification-suspended",
  "improvement-plan-assigned",
  "improvement-action-completed",
  "coaching-scheduled",
  "coaching-completed"
] as const;

export type QualityAuditActionId = (typeof QUALITY_AUDIT_ACTIONS)[number];

export const CONSULTANT_QUALITY_FUTURE_KINDS = [
  { id: "call-recordings", label: "Call recordings" },
  { id: "transcript-review", label: "Transcript review" },
  { id: "ai-quality-analysis", label: "AI quality analysis" }
] as const;

export const CONSULTATION_AUDIT_AREAS: QualityStandardId[] = [
  "communication",
  "documentation-quality",
  "member-satisfaction"
];

export const INTRODUCTION_AUDIT_AREAS: QualityStandardId[] = [
  "journey-stewardship",
  "follow-up-quality",
  "relationship-guidance"
];

export const DOCUMENTATION_AUDIT_AREAS: QualityStandardId[] = [
  "documentation-quality",
  "professionalism",
  "ethics"
];
