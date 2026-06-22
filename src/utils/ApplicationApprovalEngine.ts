import {
  applicationReviewIdYearFromDate,
  formatApplicationReviewId,
  isValidApplicationReviewId,
  normalizeApplicationReviewId,
  parseApplicationReviewId
} from "../constants/applicationApproval";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ApplicationReview, MemberApplicationApprovalBundle } from "../types/applicationApproval";
import { listConciergeMembers } from "./conciergeConsultantStore";
import {
  buildApplicationReview,
  buildMemberApplicationApprovalBundle,
  buildReviewSummary
} from "./applicationApprovalLogic";
import { readJson, writeJson } from "./storage";

type ApplicationReviewRegistryState = {
  byReviewId: Record<string, string>;
  byMemberId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

type ApplicationApprovalStore = {
  reviews: Record<string, ApplicationReview>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeApplicationApprovalStore;
const REGISTRY_KEY = STORAGE_KEYS.conciergeApplicationApprovalRegistry;

function loadRegistry(): ApplicationReviewRegistryState {
  return readJson<ApplicationReviewRegistryState>(REGISTRY_KEY, {
    byReviewId: {},
    byMemberId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: ApplicationReviewRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function loadStore(): ApplicationApprovalStore {
  return readJson<ApplicationApprovalStore>(STORE_KEY, {
    reviews: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: ApplicationApprovalStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function reviewRecordId(memberId: string): string {
  return `application_review_${memberId}`;
}

function assignReviewId(memberId: string, createdAt: string): string {
  const state = loadRegistry();
  const existing = state.byMemberId[memberId];
  if (existing) return existing;

  const year = applicationReviewIdYearFromDate(createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const reviewId = formatApplicationReviewId(year, nextSequence);

  if (state.byReviewId[reviewId]) {
    throw new Error(`Application review ID already allocated: ${reviewId}`);
  }

  saveRegistry({
    ...state,
    byReviewId: { ...state.byReviewId, [reviewId]: memberId },
    byMemberId: { ...state.byMemberId, [memberId]: reviewId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return reviewId;
}

function registerExistingReviewId(input: {
  memberId: string;
  reviewId: string;
  createdAt: string;
}): void {
  const normalized = normalizeApplicationReviewId(input.reviewId);
  if (!isValidApplicationReviewId(normalized)) return;

  const state = loadRegistry();
  if (state.byReviewId[normalized]) return;

  const parsed = parseApplicationReviewId(normalized);
  const year = parsed ? parsed.year : applicationReviewIdYearFromDate(input.createdAt);
  const sequence = parsed ? parsed.sequence : 1;

  saveRegistry({
    ...state,
    byReviewId: { ...state.byReviewId, [normalized]: input.memberId },
    byMemberId: { ...state.byMemberId, [input.memberId]: normalized },
    yearSequence: {
      ...state.yearSequence,
      [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
    }
  });
}

function ensureReviewId(memberId: string, createdAt: string, existing?: string): string {
  if (existing && isValidApplicationReviewId(existing)) {
    registerExistingReviewId({ memberId, reviewId: existing, createdAt });
    return normalizeApplicationReviewId(existing);
  }
  return assignReviewId(memberId, createdAt);
}

function syncMemberReview(member: ConciergeMemberRecord, store: ApplicationApprovalStore): ApplicationReview {
  const recordId = reviewRecordId(member.id);
  const reviewId = ensureReviewId(member.id, member.createdAt, store.reviews[recordId]?.reviewId);
  const existing = store.reviews[recordId];
  return buildApplicationReview({ member, reviewId, existing });
}

export function syncApplicationReviewsFromMembers(): ApplicationReview[] {
  const members = listConciergeMembers();
  const store = loadStore();
  const reviews = { ...store.reviews };

  for (const member of members) {
    const recordId = reviewRecordId(member.id);
    reviews[recordId] = syncMemberReview(member, store);
  }

  saveStore({ reviews, updatedAt: new Date().toISOString() });
  return Object.values(reviews).sort((a, b) => a.reviewId.localeCompare(b.reviewId));
}

export function ensureMemberApplicationApprovalBundle(
  member: ConciergeMemberRecord
): MemberApplicationApprovalBundle {
  const store = loadStore();
  const recordId = reviewRecordId(member.id);
  const review = syncMemberReview(member, store);
  saveStore({
    reviews: { ...store.reviews, [recordId]: review },
    updatedAt: new Date().toISOString()
  });
  return buildMemberApplicationApprovalBundle(member, review);
}

export function getApplicationReviewSummaryForMember(member: ConciergeMemberRecord) {
  const bundle = ensureMemberApplicationApprovalBundle(member);
  return bundle.summary;
}

export function getApplicationReviewForMember(memberId: string): ApplicationReview | null {
  const store = loadStore();
  return store.reviews[reviewRecordId(memberId)] ?? null;
}

export function listApplicationReviews(): ApplicationReview[] {
  return syncApplicationReviewsFromMembers();
}

export function resetApplicationApprovalStoreForTests(): void {
  writeJson(STORE_KEY, { reviews: {}, updatedAt: new Date().toISOString() });
  writeJson(REGISTRY_KEY, {
    byReviewId: {},
    byMemberId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}
