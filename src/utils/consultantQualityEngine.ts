import type { ConsultantQualityBundle, QualityFilterState } from "../types/consultantQuality";
import {
  buildQualityMetrics,
  buildQualityTrend,
  emptyQualityFilters,
  filterQualityReviews,
  findReviewById,
  listActiveImprovementPlans,
  listUpcomingCoachingSessions,
  sortReviewsByDate,
  summarizeStandardsCoverage
} from "./consultantQualityLogic";
import {
  listCoachingSessions,
  listConsultantCertifications,
  listConsultantQualityStoreReviews,
  listImprovementPlans,
  listQualityTrend
} from "./consultantQualityStore";

export function listConsultantQualityReviews() {
  return listConsultantQualityStoreReviews();
}

export function buildConsultantQualityBundle(
  filters: QualityFilterState = emptyQualityFilters(),
  selectedReviewId?: string | null
): ConsultantQualityBundle {
  const allReviews = listConsultantQualityStoreReviews();
  const certifications = listConsultantCertifications();
  const improvementPlans = listImprovementPlans();
  const coachingSessions = listCoachingSessions();
  const reviews = sortReviewsByDate(filterQualityReviews(allReviews, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildQualityMetrics(allReviews, certifications, improvementPlans),
    reviews,
    certifications,
    improvementPlans,
    coachingSessions,
    qualityTrend: buildQualityTrend(allReviews, listQualityTrend()),
    selectedReview: findReviewById(reviews, selectedReviewId ?? null),
    standardsCoverage: summarizeStandardsCoverage(allReviews),
    activeImprovementPlans: listActiveImprovementPlans(improvementPlans),
    upcomingCoaching: listUpcomingCoachingSessions(coachingSessions)
  };
}
