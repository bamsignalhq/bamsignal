export const CONSULTANT_PERFORMANCE_REVIEWS_BRAND = "Consultant Performance Reviews™";
export const CONSULTANT_PERFORMANCE_REVIEWS_TAGLINE =
  "Human-first stewardship reviews — celebrate journey outcomes, never sales quotas or conversion targets.";

export const PERFORMANCE_REVIEW_HUMAN_FIRST_COPY =
  "Reviews are written for growth and care. They are not rankings, commissions, or revenue scoreboards.";

export const PERFORMANCE_REVIEW_PERIODS = [
  { id: "monthly", label: "Monthly", hint: "Recent stewardship rhythm and member care." },
  { id: "quarterly", label: "Quarterly", hint: "Sustained journey outcomes across the season." },
  { id: "annual", label: "Annual", hint: "Institutional contribution and long-horizon legacy." }
] as const;

export type PerformanceReviewPeriodId = (typeof PERFORMANCE_REVIEW_PERIODS)[number]["id"];

export const PERFORMANCE_REVIEW_CATEGORIES = [
  {
    id: "consultation-quality",
    label: "Consultation quality",
    hint: "Depth, preparation, and follow-through in private consultations."
  },
  {
    id: "relationship-outcomes",
    label: "Relationship outcomes",
    hint: "Relationships, engagements, and marriages stewarded with dignity."
  },
  {
    id: "member-satisfaction",
    label: "Member satisfaction",
    hint: "How members experience care — never a sales satisfaction score."
  },
  {
    id: "documentation-quality",
    label: "Documentation quality",
    hint: "Notes, reviews, and journey records kept with integrity."
  },
  {
    id: "professional-stewardship",
    label: "Professional stewardship",
    hint: "Reliability, boundaries, and anti-poaching discipline."
  },
  {
    id: "team-contribution",
    label: "Team contribution",
    hint: "Regional teamwork, handoffs, and institutional continuity."
  }
] as const;

export type PerformanceReviewCategoryId = (typeof PERFORMANCE_REVIEW_CATEGORIES)[number]["id"];

export const PERFORMANCE_REVIEW_RATINGS = [
  { id: "exceptional", label: "Exceptional", order: 5 },
  { id: "strong", label: "Strong", order: 4 },
  { id: "good", label: "Good", order: 3 },
  { id: "developing", label: "Developing", order: 2 },
  { id: "needs-support", label: "Needs Support", order: 1 }
] as const;

export type PerformanceReviewRatingId = (typeof PERFORMANCE_REVIEW_RATINGS)[number]["id"];

export const PERFORMANCE_REVIEW_RATING_LABELS: Record<PerformanceReviewRatingId, string> =
  Object.fromEntries(PERFORMANCE_REVIEW_RATINGS.map((rating) => [rating.id, rating.label])) as Record<
    PerformanceReviewRatingId,
    string
  >;

export const PERFORMANCE_REVIEW_CATEGORY_LABELS: Record<PerformanceReviewCategoryId, string> =
  Object.fromEntries(PERFORMANCE_REVIEW_CATEGORIES.map((category) => [category.id, category.label])) as Record<
    PerformanceReviewCategoryId,
    string
  >;

export type PerformanceReviewAchievementId =
  | "consultations-100"
  | "consultations-1000"
  | "relationships-10"
  | "relationships-25"
  | "engagements-10"
  | "marriages-25"
  | "legacy-matchmaker"
  | "institution-builder";

export type PerformanceReviewAchievementDefinition = {
  id: PerformanceReviewAchievementId;
  label: string;
  target: number;
  metricKey: string;
};

export const PERFORMANCE_REVIEW_ACHIEVEMENT_DEFINITIONS: PerformanceReviewAchievementDefinition[] = [
  { id: "consultations-100", label: "100 Consultations", target: 100, metricKey: "consultationsCompleted" },
  { id: "consultations-1000", label: "1000 Consultations", target: 1000, metricKey: "consultationsCompleted" },
  { id: "relationships-10", label: "10 Relationships", target: 10, metricKey: "relationshipsFormed" },
  { id: "relationships-25", label: "25 Relationships", target: 25, metricKey: "relationshipsFormed" },
  { id: "engagements-10", label: "10 Engagements", target: 10, metricKey: "engagements" },
  { id: "marriages-25", label: "25 Marriages", target: 25, metricKey: "marriages" },
  { id: "legacy-matchmaker", label: "Legacy Matchmaker", target: 1, metricKey: "legacyArchives" },
  { id: "institution-builder", label: "Institution Builder", target: 1, metricKey: "institutionBuilder" }
];

/** Documented future pathways — not implemented. */
export const PERFORMANCE_REVIEW_FUTURE_PATHWAYS = [
  {
    id: "mentorship",
    label: "Mentorship",
    description: "Pair senior stewards with developing consultants for guided casework."
  },
  {
    id: "promotion-pathways",
    label: "Promotion pathways",
    description: "Structured progression from consultant to senior matchmaker and regional director."
  },
  {
    id: "leadership-tracks",
    label: "Leadership tracks",
    description: "Institution-building leadership for directors and legacy stewards."
  }
] as const;

export type PerformanceReviewFuturePathwayId =
  (typeof PERFORMANCE_REVIEW_FUTURE_PATHWAYS)[number]["id"];
