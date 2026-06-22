import type {
  ConsultationNotesSectionId,
  ConsultationOutcome,
  ConsultationRecommendationType,
  ConsultationReviewTimelineKind
} from "../types/consultationReview";

export const CONSULTATION_REVIEW_ENGINE_BRAND = "Consultation Review Engine™";

export const CONSULTATION_REVIEW_PRIVACY_COPY =
  "Structured consultation memory for stewards — private to consultant-admin surfaces only.";

/** Permanent Consultation Review IDs — BS-CR-YYYY-#### */
export const CONSULTATION_REVIEW_ID_PREFIX = "BS-CR";
export const CONSULTATION_REVIEW_ID_PATTERN = /^BS-CR-\d{4}-\d{4}$/;
export const CONSULTATION_REVIEW_ID_LABEL = "Review ID";

export const CONSULTATION_OUTCOMES: ConsultationOutcome[] = [
  "approved",
  "requires-review",
  "not-a-fit-yet",
  "follow-up-required",
  "paused"
];

export const CONSULTATION_OUTCOME_LABELS: Record<ConsultationOutcome, string> = {
  approved: "Approved",
  "requires-review": "Requires Review",
  "not-a-fit-yet": "Not a Fit Yet",
  "follow-up-required": "Follow-Up Required",
  paused: "Paused"
};

export const CONSULTATION_RECOMMENDATION_TYPES: ConsultationRecommendationType[] = [
  "proceed-to-application",
  "proceed-to-introductions",
  "additional-consultation",
  "relationship-coaching",
  "pause-journey"
];

export const CONSULTATION_RECOMMENDATION_LABELS: Record<ConsultationRecommendationType, string> = {
  "proceed-to-application": "Proceed to application",
  "proceed-to-introductions": "Proceed to introductions",
  "additional-consultation": "Additional consultation",
  "relationship-coaching": "Relationship coaching",
  "pause-journey": "Pause journey"
};

export const CONSULTATION_NOTES_SECTIONS: {
  id: ConsultationNotesSectionId;
  label: string;
}[] = [
  { id: "relationship-goals", label: "Relationship goals" },
  { id: "values", label: "Values" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "faith", label: "Faith" },
  { id: "family-vision", label: "Family vision" },
  { id: "compatibility-observations", label: "Compatibility observations" },
  { id: "consultant-observations", label: "Consultant observations" },
  { id: "recommendations", label: "Recommendations" }
];

export const CONSULTATION_NOTES_SECTION_LABELS: Record<ConsultationNotesSectionId, string> =
  Object.fromEntries(CONSULTATION_NOTES_SECTIONS.map((section) => [section.id, section.label])) as Record<
    ConsultationNotesSectionId,
    string
  >;

export const CONSULTATION_REVIEW_TIMELINE_EVENTS: ConsultationReviewTimelineKind[] = [
  "consultation-completed",
  "review-created",
  "recommendation-issued",
  "approval-granted",
  "follow-up-required"
];

export const CONSULTATION_REVIEW_TIMELINE_LABELS: Record<ConsultationReviewTimelineKind, string> = {
  "consultation-completed": "Consultation completed",
  "review-created": "Review created",
  "recommendation-issued": "Recommendation issued",
  "approval-granted": "Approval granted",
  "follow-up-required": "Follow-up required"
};

export const CONSULTATION_REVIEW_APPEND_ONLY_RULE =
  "Append-only review timeline — no deletion, no shrinking.";

export function emptyConsultationNotesSections(): import("../types/consultationReview").ConsultationNotesSections {
  return {
    "relationship-goals": "",
    values: "",
    lifestyle: "",
    faith: "",
    "family-vision": "",
    "compatibility-observations": "",
    "consultant-observations": "",
    recommendations: ""
  };
}

export function formatConsultationReviewId(year: number, sequence: number): string {
  return `${CONSULTATION_REVIEW_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidConsultationReviewId(value: string): boolean {
  return CONSULTATION_REVIEW_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeConsultationReviewId(value: string): string {
  return value.trim().toUpperCase();
}

export function consultationReviewIdYearFromDate(
  isoDate: string,
  fallbackYear = new Date().getFullYear()
): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
