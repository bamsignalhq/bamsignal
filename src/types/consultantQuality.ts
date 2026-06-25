import type {
  CertificationLevelId,
  QualityRatingId,
  QualityReviewTypeId,
  QualityStandardId
} from "../constants/consultantQuality";

export type QualityAreaRating = {
  areaId: QualityStandardId;
  rating: QualityRatingId;
  note: string;
};

export type ImprovementPlanAction = {
  id: string;
  standardId: QualityStandardId;
  action: string;
  deadline: string;
  status: "pending" | "in-progress" | "completed";
  followUpReviewAt?: string;
  trainingModule?: string | null;
};

export type ImprovementPlanRecord = {
  id: string;
  planRef: string;
  consultantRef: string;
  consultantName: string;
  reviewRef?: string;
  status: "active" | "completed" | "cancelled";
  actions: ImprovementPlanAction[];
  followUpReviewAt?: string;
  completedAt?: string;
  createdAt: string;
};

/** @deprecated use ImprovementPlanAction on ImprovementPlanRecord */
export type ImprovementPlanItem = {
  areaId: QualityStandardId;
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
  reviewType: QualityReviewTypeId;
  reviewedAt: string;
  journeyRef: string;
  overallScore: number;
  summary: string;
  areaRatings: QualityAreaRating[];
  improvementPlan: ImprovementPlanItem[];
  appendLog: QualityAppendEntry[];
};

export type ConsultantCertificationRecord = {
  id: string;
  consultantRef: string;
  consultantName: string;
  certificationLevel: CertificationLevelId;
  status: "active" | "expired" | "suspended";
  issuedAt: string;
  expiresAt?: string;
  issuedBy: string;
  notes?: string;
};

export type CoachingSessionRecord = {
  id: string;
  sessionRef: string;
  consultantRef: string;
  consultantName: string;
  coachEmail: string;
  topic: string;
  status: "scheduled" | "completed" | "cancelled";
  scheduledAt: string;
  completedAt?: string;
  notes?: string;
};

export type QualityTrendPoint = {
  month: string;
  averageScore: number;
  reviewCount: number;
};

export type QualityFilterState = {
  query: string;
  rating: QualityRatingId | "all";
  reviewType: QualityReviewTypeId | "all";
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
  certifications: ConsultantCertificationRecord[];
  improvementPlans: ImprovementPlanRecord[];
  coachingSessions: CoachingSessionRecord[];
  qualityTrend: QualityTrendPoint[];
  selectedReview: QualityReviewRecord | null;
  standardsCoverage: {
    standardId: import("../constants/consultantQuality").QualityStandardId;
    label: string;
    averageScore: number | null;
    reviewCount: number;
  }[];
  activeImprovementPlans: ImprovementPlanRecord[];
  upcomingCoaching: CoachingSessionRecord[];
};
