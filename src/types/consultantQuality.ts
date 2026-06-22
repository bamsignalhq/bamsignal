import type { QualityRatingId, QualityReviewAreaId } from "../constants/consultantQuality";

export type QualityAreaRating = {
  areaId: QualityReviewAreaId;
  rating: QualityRatingId;
  note: string;
};

export type ImprovementPlanItem = {
  areaId: QualityReviewAreaId;
  recommendation: string;
  trainingModule: string | null;
};

export type QualityAppendEntry = {
  id: string;
  actor: string;
  timestamp: string;
  action: string;
  note: string;
};

export type QualityReviewRecord = {
  id: string;
  reviewRef: string;
  consultantRef: string;
  consultantName: string;
  reviewer: string;
  reviewedAt: string;
  journeyRef: string;
  overallScore: number;
  summary: string;
  areaRatings: QualityAreaRating[];
  improvementPlan: ImprovementPlanItem[];
  appendLog: QualityAppendEntry[];
};

export type QualityFilterState = {
  query: string;
  rating: QualityRatingId | "all";
};

export type QualityMetric = {
  id: import("../constants/consultantQuality").QualityMetricId;
  label: string;
  value: string;
  numericValue?: number;
};

export type ConsultantQualityBundle = {
  generatedAt: string;
  metrics: QualityMetric[];
  reviews: QualityReviewRecord[];
  selectedReview: QualityReviewRecord | null;
};
