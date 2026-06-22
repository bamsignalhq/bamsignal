/** Consultant Performance Scorecard — relationship outcomes, not sales. Admin only. */

export const CONSULTANT_PERFORMANCE_TITLE = "Consultant Performance Scorecard";
export const RELATIONSHIP_OUTCOMES_TITLE = "Relationship Outcomes";
export const JOURNEY_SUCCESS_TITLE = "Journey Success";
export const MEMBER_SATISFACTION_TITLE = "Member Satisfaction";
export const CONSULTANT_HEALTH_TITLE = "Consultant Health";
export const CONSULTANT_ACHIEVEMENTS_TITLE = "Achievements";
export const PERFORMANCE_TRENDS_TITLE = "Performance Trends";
export const CONSULTANT_STRENGTHS_TITLE = "Consultant Strengths";
export const RELATIONSHIP_QUALITY_TITLE = "Relationship Quality";

export const SCORECARD_SUBCOPY =
  "Measure relationship outcomes and journey success — never revenue, sales, or conversion rates.";

export type ConsultantAchievementId =
  | "consultations-100"
  | "consultations-1000"
  | "relationships-10"
  | "relationships-25"
  | "engagements-10"
  | "marriages-25"
  | "legacy-matchmaker"
  | "institution-builder";

export type ConsultantAchievementDefinition = {
  id: ConsultantAchievementId;
  label: string;
  target: number;
  metricKey: keyof ConsultantPerformanceMetricKeys | "institutionBuilder";
};

export type ConsultantPerformanceMetricKeys = {
  consultationsCompleted: number;
  applicationsReviewed: number;
  introductionsMade: number;
  followUpsCompleted: number;
  relationshipsFormed: number;
  exclusiveRelationships: number;
  engagements: number;
  marriages: number;
  legacyArchives: number;
};

export const CONSULTANT_ACHIEVEMENT_DEFINITIONS: ConsultantAchievementDefinition[] = [
  { id: "consultations-100", label: "100 Consultations", target: 100, metricKey: "consultationsCompleted" },
  { id: "consultations-1000", label: "1000 Consultations", target: 1000, metricKey: "consultationsCompleted" },
  { id: "relationships-10", label: "10 Relationships", target: 10, metricKey: "relationshipsFormed" },
  { id: "relationships-25", label: "25 Relationships", target: 25, metricKey: "relationshipsFormed" },
  { id: "engagements-10", label: "10 Engagements", target: 10, metricKey: "engagements" },
  { id: "marriages-25", label: "25 Marriages", target: 25, metricKey: "marriages" },
  { id: "legacy-matchmaker", label: "Legacy Matchmaker", target: 1, metricKey: "legacyArchives" },
  { id: "institution-builder", label: "Institution Builder", target: 1, metricKey: "institutionBuilder" }
];

export const RELATIONSHIP_METRIC_LABELS: Record<keyof ConsultantPerformanceMetricKeys, string> = {
  consultationsCompleted: "Consultations completed",
  applicationsReviewed: "Applications reviewed",
  introductionsMade: "Introductions made",
  followUpsCompleted: "Follow-ups completed",
  relationshipsFormed: "Relationships formed",
  exclusiveRelationships: "Exclusive relationships",
  engagements: "Engagements",
  marriages: "Marriages",
  legacyArchives: "Legacy archives"
};

export const OUTCOME_METRIC_KEYS = [
  "consultationsCompleted",
  "applicationsReviewed",
  "introductionsMade",
  "followUpsCompleted",
  "relationshipsFormed",
  "exclusiveRelationships",
  "engagements",
  "marriages"
] as const;

export const HEALTH_METRIC_LABELS = {
  activeMembers: "Active members",
  workload: "Workload",
  pendingFollowUps: "Pending follow-ups",
  upcomingMeetings: "Upcoming meetings",
  responseQuality: "Response quality"
} as const;

/** Reserved — permissions not implemented. */
export const CONSULTANT_FUTURE_RANKINGS = [
  { id: "senior-matchmaker", label: "Senior Matchmaker rankings" },
  { id: "diaspora-specialist", label: "Diaspora specialists" },
  { id: "family-advisor", label: "Family advisors" },
  { id: "relationship-coach", label: "Relationship coaches" }
] as const;

export type ConsultantFutureRankingKind = (typeof CONSULTANT_FUTURE_RANKINGS)[number]["id"];

export function getConsultantAchievementDefinition(id: ConsultantAchievementId) {
  return CONSULTANT_ACHIEVEMENT_DEFINITIONS.find((item) => item.id === id) ?? null;
}
