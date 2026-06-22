import {
  formatConsultationReviewId,
  isValidConsultationReviewId,
  consultationReviewIdYearFromDate,
  normalizeConsultationReviewId
} from "../constants/consultationReview";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConsultationReview } from "../types/consultationReview";
import { readJson, writeJson } from "./storage";

type ConsultationReviewRegistryState = {
  byReviewId: Record<string, string>;
  byRecordId: Record<string, string>;
  byMemberId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

type ConsultationReviewStore = {
  reviews: Record<string, ConsultationReview>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeConsultationReviewStore;
const REGISTRY_KEY = STORAGE_KEYS.conciergeConsultationReviewRegistry;

function loadRegistry(): ConsultationReviewRegistryState {
  return readJson<ConsultationReviewRegistryState>(REGISTRY_KEY, {
    byReviewId: {},
    byRecordId: {},
    byMemberId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: ConsultationReviewRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function loadStore(): ConsultationReviewStore {
  return readJson<ConsultationReviewStore>(STORE_KEY, {
    reviews: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: ConsultationReviewStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function reviewRecordId(memberId: string, heldAt: string): string {
  return `consultation_review_${memberId}_${heldAt.slice(0, 10)}`;
}

export function assignConsultationReviewId(input: {
  recordId: string;
  memberId: string;
  createdAt: string;
}): string {
  const state = loadRegistry();
  const existing = state.byRecordId[input.recordId] ?? state.byMemberId[input.memberId];
  if (existing) return existing;

  const year = consultationReviewIdYearFromDate(input.createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const reviewId = formatConsultationReviewId(year, nextSequence);

  if (state.byReviewId[reviewId]) {
    throw new Error(`Consultation review ID already allocated: ${reviewId}`);
  }

  saveRegistry({
    ...state,
    byReviewId: { ...state.byReviewId, [reviewId]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: reviewId },
    byMemberId: { ...state.byMemberId, [input.memberId]: reviewId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return reviewId;
}

function ensureReviewId(
  recordId: string,
  memberId: string,
  at: string,
  existing?: string
): string {
  if (existing && isValidConsultationReviewId(existing)) {
    return normalizeConsultationReviewId(existing);
  }
  return assignConsultationReviewId({ recordId, memberId, createdAt: at });
}

export function getConsultationReview(recordId: string): ConsultationReview | null {
  const store = loadStore();
  return store.reviews[recordId] ?? null;
}

export function listConsultationReviews(): ConsultationReview[] {
  const store = loadStore();
  return Object.values(store.reviews).sort(
    (a, b) => new Date(b.heldAt).getTime() - new Date(a.heldAt).getTime()
  );
}

export function listConsultationReviewsForMember(memberId: string): ConsultationReview[] {
  return listConsultationReviews().filter((review) => review.memberId === memberId);
}

export function saveConsultationReview(review: ConsultationReview): ConsultationReview {
  const store = loadStore();
  const recordId = review.id || reviewRecordId(review.memberId, review.heldAt);
  const reviewId = ensureReviewId(recordId, review.memberId, review.createdAt, review.reviewId);
  const next: ConsultationReview = { ...review, id: recordId, reviewId };
  saveStore({
    reviews: { ...store.reviews, [recordId]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function resetConsultationReviewStoreForTests(): void {
  writeJson(STORE_KEY, { reviews: {}, updatedAt: new Date().toISOString() });
  writeJson(REGISTRY_KEY, {
    byReviewId: {},
    byRecordId: {},
    byMemberId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

export { reviewRecordId };
