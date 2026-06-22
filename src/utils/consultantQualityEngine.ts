import { CONSULTANT_QUALITY_SEED } from "../data/consultantQualitySeed";
import type { ConsultantQualityBundle, QualityFilterState } from "../types/consultantQuality";
import {
  buildQualityMetrics,
  emptyQualityFilters,
  filterQualityReviews,
  findReviewById,
  listQualityReviews,
  sortReviewsByDate
} from "./consultantQualityLogic";
import { readJson } from "./storage";

const STORAGE_KEY = "bamsignal.consultantQuality.v1";

type ConsultantQualityState = {
  reviews: typeof CONSULTANT_QUALITY_SEED;
  updatedAt: string;
};

function defaultState(): ConsultantQualityState {
  return {
    reviews: [...CONSULTANT_QUALITY_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): ConsultantQualityState {
  const stored = readJson<ConsultantQualityState>(STORAGE_KEY, defaultState());
  if (!stored?.reviews?.length) return defaultState();
  return stored;
}

export function listConsultantQualityReviews() {
  return loadState().reviews;
}

export function buildConsultantQualityBundle(
  filters: QualityFilterState = emptyQualityFilters(),
  selectedReviewId?: string | null
): ConsultantQualityBundle {
  const allReviews = listConsultantQualityReviews();
  const reviews = sortReviewsByDate(filterQualityReviews(allReviews, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildQualityMetrics(allReviews),
    reviews,
    selectedReview: findReviewById(reviews, selectedReviewId ?? null)
  };
}
