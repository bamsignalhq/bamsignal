import type {
  PerformanceReviewAchievementId,
  PerformanceReviewCategoryId,
  PerformanceReviewPeriodId,
  PerformanceReviewRatingId
} from "../constants/consultantPerformanceReviews";
import type { ConsultantPerformanceScorecard } from "./consultantPerformanceScorecard";

export type PerformanceReviewCategoryScore = {
  id: PerformanceReviewCategoryId;
  label: string;
  rating: PerformanceReviewRatingId;
  ratingLabel: string;
  narrative: string;
  evidence: string[];
};

export type PerformanceReviewGrowthFocus = {
  id: string;
  categoryId: PerformanceReviewCategoryId;
  categoryLabel: string;
  title: string;
  detail: string;
};

export type PerformanceReviewAchievementEvent = {
  id: PerformanceReviewAchievementId;
  label: string;
  earned: boolean;
  earnedAt?: string;
  progress: number;
  target: number;
};

export type ConsultantPerformanceReview = {
  consultantId: string;
  consultantName: string;
  period: PerformanceReviewPeriodId;
  periodLabel: string;
  reviewedAt: string;
  overallRating: PerformanceReviewRatingId;
  overallRatingLabel: string;
  summary: string;
  categories: PerformanceReviewCategoryScore[];
  growthPlan: PerformanceReviewGrowthFocus[];
  achievements: PerformanceReviewAchievementEvent[];
};

export type ConsultantPerformanceReviewBundle = {
  consultantId: string;
  consultantName: string;
  scorecard: ConsultantPerformanceScorecard;
  reviews: ConsultantPerformanceReview[];
  updatedAt: string;
};
