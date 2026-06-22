import {
  PERFORMANCE_REVIEW_ACHIEVEMENT_DEFINITIONS,
  PERFORMANCE_REVIEW_CATEGORIES,
  PERFORMANCE_REVIEW_CATEGORY_LABELS,
  PERFORMANCE_REVIEW_PERIODS,
  PERFORMANCE_REVIEW_RATING_LABELS,
  PERFORMANCE_REVIEW_RATINGS,
  type PerformanceReviewCategoryId,
  type PerformanceReviewPeriodId,
  type PerformanceReviewRatingId
} from "../constants/consultantPerformanceReviews";
import { REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS } from "../constants/regionalConsultantTeams";
import type { ConciergeConsultantActivity } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  ConsultantHealthSnapshot,
  ConsultantPerformanceScorecard,
  ConsultantRelationshipMetrics
} from "../types/consultantPerformanceScorecard";
import type {
  ConsultantPerformanceReview,
  ConsultantPerformanceReviewBundle,
  PerformanceReviewAchievementEvent,
  PerformanceReviewCategoryScore,
  PerformanceReviewGrowthFocus
} from "../types/consultantPerformanceReviews";
import {
  buildConsultantPerformanceScorecard,
  computeInstitutionBuilderScore
} from "./consultantPerformanceScorecardLogic";

const RATING_ORDER: Record<PerformanceReviewRatingId, number> = Object.fromEntries(
  PERFORMANCE_REVIEW_RATINGS.map((rating) => [rating.id, rating.order])
) as Record<PerformanceReviewRatingId, number>;

function ratingFromScore(score: number): PerformanceReviewRatingId {
  if (score >= 90) return "exceptional";
  if (score >= 75) return "strong";
  if (score >= 60) return "good";
  if (score >= 40) return "developing";
  return "needs-support";
}

function averageRating(ratings: PerformanceReviewRatingId[]): PerformanceReviewRatingId {
  if (!ratings.length) return "developing";
  const average =
    ratings.reduce((sum, rating) => sum + RATING_ORDER[rating], 0) / ratings.length;
  if (average >= 4.5) return "exceptional";
  if (average >= 3.5) return "strong";
  if (average >= 2.5) return "good";
  if (average >= 1.5) return "developing";
  return "needs-support";
}

function scoreConsultationQuality(
  metrics: ConsultantRelationshipMetrics,
  health: ConsultantHealthSnapshot
): number {
  let score = 55;
  if (metrics.consultationsCompleted >= 20) score += 15;
  if (metrics.consultationsCompleted >= 100) score += 10;
  if (health.responseQuality === "excellent") score += 15;
  if (health.responseQuality === "good") score += 8;
  if (health.responseQuality === "needs-attention") score -= 15;
  if (health.upcomingMeetings > 0) score += 5;
  return Math.max(0, Math.min(100, score));
}

function scoreRelationshipOutcomes(metrics: ConsultantRelationshipMetrics): number {
  let score = 45;
  score += Math.min(25, metrics.relationshipsFormed * 3);
  score += Math.min(15, metrics.engagements * 4);
  score += Math.min(15, metrics.marriages * 5);
  if (metrics.legacyArchives > 0) score += 10;
  return Math.max(0, Math.min(100, score));
}

function scoreMemberSatisfaction(metrics: ConsultantRelationshipMetrics): number {
  if (metrics.memberSatisfaction === null && metrics.retentionRate === null) return 50;
  let score = 50;
  if (metrics.memberSatisfaction !== null) score = metrics.memberSatisfaction;
  if (metrics.retentionRate !== null) score = Math.round((score + metrics.retentionRate) / 2);
  return Math.max(0, Math.min(100, score));
}

function scoreDocumentationQuality(metrics: ConsultantRelationshipMetrics): number {
  let score = 50;
  score += Math.min(20, metrics.applicationsReviewed * 2);
  score += Math.min(20, metrics.followUpsCompleted * 2);
  if (metrics.consultationsCompleted > 0 && metrics.applicationsReviewed === 0) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function scoreProfessionalStewardship(
  metrics: ConsultantRelationshipMetrics,
  health: ConsultantHealthSnapshot
): number {
  let score = 60;
  if (metrics.retentionRate !== null && metrics.retentionRate >= 80) score += 15;
  if (health.responseQuality === "excellent") score += 10;
  if (health.workload > 14) score -= 10;
  if (health.pendingFollowUps > 6) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function scoreTeamContribution(
  consultantId: string,
  metrics: ConsultantRelationshipMetrics
): number {
  const isDirector = Object.values(REGIONAL_TEAM_DIRECTOR_ASSIGNMENTS).includes(consultantId);
  let score = 50;
  if (isDirector) score += 25;
  score += Math.min(15, metrics.introductionsMade);
  score += Math.min(10, metrics.legacyArchives * 5);
  return Math.max(0, Math.min(100, score));
}

function categoryScore(
  categoryId: PerformanceReviewCategoryId,
  consultantId: string,
  metrics: ConsultantRelationshipMetrics,
  health: ConsultantHealthSnapshot
): number {
  switch (categoryId) {
    case "consultation-quality":
      return scoreConsultationQuality(metrics, health);
    case "relationship-outcomes":
      return scoreRelationshipOutcomes(metrics);
    case "member-satisfaction":
      return scoreMemberSatisfaction(metrics);
    case "documentation-quality":
      return scoreDocumentationQuality(metrics);
    case "professional-stewardship":
      return scoreProfessionalStewardship(metrics, health);
    case "team-contribution":
      return scoreTeamContribution(consultantId, metrics);
    default:
      return 50;
  }
}

function categoryEvidence(
  categoryId: PerformanceReviewCategoryId,
  metrics: ConsultantRelationshipMetrics,
  health: ConsultantHealthSnapshot
): string[] {
  switch (categoryId) {
    case "consultation-quality":
      return [
        `${metrics.consultationsCompleted} consultations completed`,
        `Response quality: ${health.responseQuality}`,
        `${health.upcomingMeetings} upcoming meetings`
      ];
    case "relationship-outcomes":
      return [
        `${metrics.relationshipsFormed} relationships formed`,
        `${metrics.engagements} engagements`,
        `${metrics.marriages} marriages`
      ];
    case "member-satisfaction":
      return [
        metrics.memberSatisfaction !== null
          ? `${metrics.memberSatisfaction}% introduction satisfaction`
          : "Satisfaction data still forming",
        metrics.retentionRate !== null
          ? `${metrics.retentionRate}% member retention`
          : "Retention baseline forming"
      ];
    case "documentation-quality":
      return [
        `${metrics.applicationsReviewed} applications reviewed`,
        `${metrics.followUpsCompleted} follow-ups documented`
      ];
    case "professional-stewardship":
      return [
        `${health.activeMembers} active members`,
        `${health.pendingFollowUps} pending follow-ups`,
        `Workload score ${health.workload}`
      ];
    case "team-contribution":
      return [
        `${metrics.introductionsMade} introductions stewarded`,
        `${metrics.legacyArchives} legacy archives supported`
      ];
    default:
      return [];
  }
}

function categoryNarrative(
  categoryId: PerformanceReviewCategoryId,
  rating: PerformanceReviewRatingId,
  period: PerformanceReviewPeriodId
): string {
  const label = PERFORMANCE_REVIEW_CATEGORY_LABELS[categoryId];
  const periodWord =
    period === "monthly" ? "this month" : period === "quarterly" ? "this quarter" : "this year";

  switch (rating) {
    case "exceptional":
      return `${label} is exceptional ${periodWord} — a model for human-first stewardship.`;
    case "strong":
      return `${label} is strong ${periodWord} with consistent member care.`;
    case "good":
      return `${label} is good ${periodWord} and steadily improving.`;
    case "developing":
      return `${label} is developing ${periodWord} — focused coaching will help.`;
    case "needs-support":
      return `${label} needs support ${periodWord} — prioritize gentle coaching and capacity relief.`;
    default:
      return `${label} reviewed ${periodWord}.`;
  }
}

function buildCategoryScores(
  consultantId: string,
  metrics: ConsultantRelationshipMetrics,
  health: ConsultantHealthSnapshot,
  period: PerformanceReviewPeriodId
): PerformanceReviewCategoryScore[] {
  return PERFORMANCE_REVIEW_CATEGORIES.map((category) => {
    const rawScore = categoryScore(category.id, consultantId, metrics, health);
    const rating = ratingFromScore(rawScore);
    return {
      id: category.id,
      label: category.label,
      rating,
      ratingLabel: PERFORMANCE_REVIEW_RATING_LABELS[rating],
      narrative: categoryNarrative(category.id, rating, period),
      evidence: categoryEvidence(category.id, metrics, health)
    };
  });
}

function buildGrowthPlan(categories: PerformanceReviewCategoryScore[]): PerformanceReviewGrowthFocus[] {
  return categories
    .filter((category) => category.rating === "developing" || category.rating === "needs-support")
    .map((category, index) => ({
      id: `growth_${category.id}`,
      categoryId: category.id,
      categoryLabel: category.label,
      title: `Strengthen ${category.label.toLowerCase()}`,
      detail:
        category.rating === "needs-support"
          ? `Schedule a human-first coaching conversation and reduce caseload friction in ${category.label.toLowerCase()}.`
          : `Continue mentoring and shadowing to lift ${category.label.toLowerCase()} toward strong.`
    }))
    .concat(
      categories.every((category) => RATING_ORDER[category.rating] >= RATING_ORDER.good)
        ? [
            {
              id: "growth_maintain",
              categoryId: "professional-stewardship" as const,
              categoryLabel: "Professional stewardship",
              title: "Maintain stewardship excellence",
              detail: "Continue documenting journeys and mentoring newer consultants when capacity allows."
            }
          ]
        : []
    )
    .slice(0, 4);
}

function achievementMetricValue(
  metrics: ConsultantRelationshipMetrics,
  metricKey: string
): number {
  if (metricKey === "institutionBuilder") return computeInstitutionBuilderScore(metrics);
  return (metrics[metricKey as keyof ConsultantRelationshipMetrics] as number) ?? 0;
}

function latestActivityAt(
  activity: ConciergeConsultantActivity[],
  members: ConciergeMemberRecord[]
): string | undefined {
  const activityDates = activity
    .map((item) => item.at)
    .filter((value): value is string => Boolean(value));
  const timelineDates = members.flatMap((member) =>
    (member.timeline ?? []).map((event) => event.at)
  );
  const candidates = [...activityDates, ...timelineDates].sort();
  return candidates[candidates.length - 1];
}

function buildReviewAchievements(
  metrics: ConsultantRelationshipMetrics,
  activity: ConciergeConsultantActivity[],
  members: ConciergeMemberRecord[]
): PerformanceReviewAchievementEvent[] {
  const fallbackAt = latestActivityAt(activity, members);

  return PERFORMANCE_REVIEW_ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress = achievementMetricValue(metrics, definition.metricKey);
    const earned = progress >= definition.target;
    return {
      id: definition.id,
      label: definition.label,
      earned,
      earnedAt: earned ? fallbackAt : undefined,
      progress,
      target: definition.target
    };
  });
}

function reviewSummary(
  consultantName: string,
  period: PerformanceReviewPeriodId,
  overallRating: PerformanceReviewRatingId
): string {
  const periodLabel = PERFORMANCE_REVIEW_PERIODS.find((entry) => entry.id === period)?.label ?? period;
  const ratingLabel = PERFORMANCE_REVIEW_RATING_LABELS[overallRating];

  return `${consultantName}'s ${periodLabel.toLowerCase()} review is ${ratingLabel.toLowerCase()} overall — grounded in relationship outcomes, member care, and institutional stewardship. This is not a sales performance review.`;
}

export function buildConsultantPerformanceReview(input: {
  scorecard: ConsultantPerformanceScorecard;
  period: PerformanceReviewPeriodId;
  activity?: ConciergeConsultantActivity[];
  members?: ConciergeMemberRecord[];
}): ConsultantPerformanceReview {
  const { scorecard, period } = input;
  const activity = input.activity ?? [];
  const members = input.members ?? [];
  const periodMeta = PERFORMANCE_REVIEW_PERIODS.find((entry) => entry.id === period)!;
  const categories = buildCategoryScores(
    scorecard.consultantId,
    scorecard.relationshipMetrics,
    scorecard.health,
    period
  );
  const overallRating = averageRating(categories.map((category) => category.rating));

  return {
    consultantId: scorecard.consultantId,
    consultantName: scorecard.consultantName,
    period,
    periodLabel: periodMeta.label,
    reviewedAt: new Date().toISOString(),
    overallRating,
    overallRatingLabel: PERFORMANCE_REVIEW_RATING_LABELS[overallRating],
    summary: reviewSummary(scorecard.consultantName, period, overallRating),
    categories,
    growthPlan: buildGrowthPlan(categories),
    achievements: buildReviewAchievements(scorecard.relationshipMetrics, activity, members)
  };
}

export function buildConsultantPerformanceReviewBundle(input: {
  consultantId: string;
  consultantName: string;
  members: ConciergeMemberRecord[];
  activity: ConciergeConsultantActivity[];
  meetings: import("../types/conciergeConsultantDirectory").ConciergeScheduledMeeting[];
}): ConsultantPerformanceReviewBundle {
  const scorecard = buildConsultantPerformanceScorecard(input);

  return {
    consultantId: input.consultantId,
    consultantName: input.consultantName,
    scorecard,
    reviews: PERFORMANCE_REVIEW_PERIODS.map((period) =>
      buildConsultantPerformanceReview({
        scorecard,
        period: period.id,
        activity: input.activity,
        members: input.members
      })
    ),
    updatedAt: new Date().toISOString()
  };
}

export function getPerformanceReviewForPeriod(
  bundle: ConsultantPerformanceReviewBundle,
  period: PerformanceReviewPeriodId
): ConsultantPerformanceReview | null {
  return bundle.reviews.find((review) => review.period === period) ?? null;
}

export function assertPerformanceReviewExcludesSales(review: ConsultantPerformanceReview): boolean {
  const serialized = JSON.stringify(review).toLowerCase();
  const forbidden = ["revenue", "sales quota", "conversion rate", "commission", "top seller"];
  return !forbidden.some((term) => serialized.includes(term));
}
