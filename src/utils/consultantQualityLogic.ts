import {
  QUALITY_METRICS,
  QUALITY_RATING_SCORES,
  QUALITY_STANDARDS
} from "../constants/consultantQuality";
import type {
  CoachingSessionRecord,
  ConsultantCertificationRecord,
  ImprovementPlanRecord,
  QualityAppendEntry,
  QualityFilterState,
  QualityReviewRecord,
  QualityTrendPoint
} from "../types/consultantQuality";
import type { QualityRatingId, QualityReviewTypeId } from "../constants/consultantQuality";

const IMPROVEMENT_RATINGS: QualityRatingId[] = ["needs-improvement", "requires-review"];

export function normalizeQualityReview(review: QualityReviewRecord): QualityReviewRecord {
  return {
    ...review,
    reviewType: review.reviewType ?? "manager-review",
    appendLog: Array.isArray(review.appendLog) ? review.appendLog : []
  };
}

export function sortReviewsByDate(reviews: QualityReviewRecord[]): QualityReviewRecord[] {
  return [...reviews].sort(
    (left, right) => new Date(right.reviewedAt).getTime() - new Date(left.reviewedAt).getTime()
  );
}

export function findReviewById(
  reviews: QualityReviewRecord[],
  reviewId: string | null
): QualityReviewRecord | null {
  if (!reviewId) return null;
  return reviews.find((review) => review.id === reviewId) ?? null;
}

export function filterQualityReviews(
  reviews: QualityReviewRecord[],
  filters: QualityFilterState
): QualityReviewRecord[] {
  const query = filters.query.trim().toLowerCase();

  return reviews.filter((review) => {
    if (filters.rating !== "all") {
      const hasRating = review.areaRatings.some((area) => area.rating === filters.rating);
      if (!hasRating) return false;
    }
    if (filters.reviewType !== "all" && review.reviewType !== filters.reviewType) {
      return false;
    }
    if (!query) return true;

    const haystack = [
      review.reviewRef,
      review.consultantName,
      review.consultantRef,
      review.journeyRef,
      review.reviewer,
      review.summary,
      review.reviewType
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function countAreasNeedingImprovement(reviews: QualityReviewRecord[]): number {
  let count = 0;
  for (const review of reviews) {
    for (const area of review.areaRatings) {
      if (IMPROVEMENT_RATINGS.includes(area.rating)) count += 1;
    }
  }
  return count;
}

export function countTrainingRecommendations(reviews: QualityReviewRecord[]): number {
  return reviews.reduce((sum, review) => sum + review.improvementPlan.length, 0);
}

export function countActiveCertifications(certifications: ConsultantCertificationRecord[]): number {
  return certifications.filter((item) => item.status === "active").length;
}

export function countOpenImprovementPlans(plans: ImprovementPlanRecord[]): number {
  return plans.filter((item) => item.status === "active").length;
}

export function averageQualityScore(reviews: QualityReviewRecord[]): number | null {
  if (!reviews.length) return null;
  const total = reviews.reduce((sum, review) => sum + review.overallScore, 0);
  return Math.round(total / reviews.length);
}

export function computeOverallScore(areaRatings: QualityReviewRecord["areaRatings"]): number {
  if (!areaRatings.length) return 0;
  const total = areaRatings.reduce((sum, area) => sum + QUALITY_RATING_SCORES[area.rating], 0);
  return Math.round(total / areaRatings.length);
}

export function buildQualityMetrics(
  reviews: QualityReviewRecord[],
  certifications: ConsultantCertificationRecord[],
  improvementPlans: ImprovementPlanRecord[]
) {
  const avgScore = averageQualityScore(reviews);
  const values: Record<string, string> = {
    "reviews-completed": String(reviews.length),
    "average-quality-score": avgScore === null ? "—" : `${avgScore}%`,
    "areas-needing-improvement": String(countAreasNeedingImprovement(reviews)),
    "training-recommendations": String(countTrainingRecommendations(reviews)),
    "active-certifications": String(countActiveCertifications(certifications)),
    "open-improvement-plans": String(countOpenImprovementPlans(improvementPlans))
  };

  return QUALITY_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]) || undefined
  }));
}

export function buildQualityTrend(
  reviews: QualityReviewRecord[],
  seededTrend: QualityTrendPoint[]
): QualityTrendPoint[] {
  if (!reviews.length) return seededTrend;

  const buckets = new Map<string, { total: number; count: number }>();
  for (const review of reviews) {
    const month = review.reviewedAt.slice(0, 7);
    const bucket = buckets.get(month) ?? { total: 0, count: 0 };
    bucket.total += review.overallScore;
    bucket.count += 1;
    buckets.set(month, bucket);
  }

  const fromReviews = [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, bucket]) => ({
      month,
      averageScore: Math.round(bucket.total / bucket.count),
      reviewCount: bucket.count
    }));

  const merged = new Map<string, QualityTrendPoint>();
  for (const point of seededTrend) merged.set(point.month, point);
  for (const point of fromReviews) merged.set(point.month, point);

  return [...merged.values()].sort((left, right) => left.month.localeCompare(right.month));
}

export function summarizeStandardsCoverage(reviews: QualityReviewRecord[]) {
  return QUALITY_STANDARDS.map((standard) => {
    let total = 0;
    let count = 0;
    for (const review of reviews) {
      for (const area of review.areaRatings) {
        if (area.areaId === standard.id) {
          total += QUALITY_RATING_SCORES[area.rating];
          count += 1;
        }
      }
    }
    return {
      standardId: standard.id,
      label: standard.label,
      averageScore: count ? Math.round(total / count) : null,
      reviewCount: count
    };
  });
}

export function emptyQualityFilters(): QualityFilterState {
  return {
    query: "",
    rating: "all",
    reviewType: "all"
  };
}

export function listUpcomingCoachingSessions(sessions: CoachingSessionRecord[]) {
  return [...sessions]
    .filter((item) => item.status === "scheduled")
    .sort((left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime());
}

export function listActiveImprovementPlans(plans: ImprovementPlanRecord[]) {
  return plans.filter((item) => item.status === "active");
}

/**
 * Append-only integrity — quality reviews never modify original records.
 */
export function assertQualityAppendLogAppendOnly(
  previous: QualityAppendEntry[],
  next: QualityAppendEntry[]
): void {
  if (next.length < previous.length) {
    throw new Error("Quality integrity violation: append log entries cannot be deleted");
  }

  for (let index = 0; index < previous.length; index += 1) {
    const prior = previous[index];
    const current = next[index];
    if (
      prior.id !== current.id ||
      prior.timestamp !== current.timestamp ||
      prior.actor !== current.actor ||
      prior.action !== current.action
    ) {
      throw new Error("Quality integrity violation: append log cannot be modified");
    }
  }
}

export function assertQualityReviewImmutable(
  previous: QualityReviewRecord,
  next: QualityReviewRecord
): void {
  if (previous.id !== next.id) {
    throw new Error("Quality integrity violation: review identity cannot change");
  }

  const immutableFields: (keyof QualityReviewRecord)[] = [
    "reviewRef",
    "consultantRef",
    "consultantName",
    "reviewer",
    "reviewType",
    "reviewedAt",
    "journeyRef",
    "overallScore",
    "summary",
    "areaRatings"
  ];

  for (const field of immutableFields) {
    if (JSON.stringify(previous[field]) !== JSON.stringify(next[field])) {
      throw new Error(`Quality integrity violation: ${field} is immutable`);
    }
  }

  assertQualityAppendLogAppendOnly(previous.appendLog, next.appendLog);
}

export function appendQualityReviewLogEntry(
  review: QualityReviewRecord,
  input: Omit<QualityAppendEntry, "id" | "timestamp">
): QualityReviewRecord {
  const entry: QualityAppendEntry = {
    ...input,
    id: `quality_append_${String(review.appendLog.length + 1).padStart(4, "0")}`,
    timestamp: new Date().toISOString()
  };
  const nextLog = [...review.appendLog, entry];
  assertQualityAppendLogAppendOnly(review.appendLog, nextLog);
  return { ...review, appendLog: nextLog };
}

export type { QualityReviewTypeId };
