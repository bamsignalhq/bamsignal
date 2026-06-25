import type { QualityAuditActionId } from "../constants/consultantQuality";
import {
  COACHING_SESSION_SEED,
  CONSULTANT_CERTIFICATION_SEED,
  CONSULTANT_QUALITY_SEED,
  IMPROVEMENT_PLAN_SEED,
  QUALITY_TREND_SEED
} from "../data/consultantQualitySeed";
import type {
  CoachingSessionRecord,
  ConsultantCertificationRecord,
  ImprovementPlanRecord,
  QualityReviewRecord
} from "../types/consultantQuality";
import { appendAuditCenterEvent } from "./auditCenterEngine";
import {
  appendQualityReviewLogEntry,
  normalizeQualityReview
} from "./consultantQualityLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.consultantQuality.v3";

type ConsultantQualityStoreState = {
  reviews: QualityReviewRecord[];
  certifications: ConsultantCertificationRecord[];
  improvementPlans: ImprovementPlanRecord[];
  coachingSessions: CoachingSessionRecord[];
  qualityTrend: typeof QUALITY_TREND_SEED;
  updatedAt: string;
};

function defaultState(): ConsultantQualityStoreState {
  return {
    reviews: CONSULTANT_QUALITY_SEED.map(normalizeQualityReview),
    certifications: [...CONSULTANT_CERTIFICATION_SEED],
    improvementPlans: [...IMPROVEMENT_PLAN_SEED],
    coachingSessions: [...COACHING_SESSION_SEED],
    qualityTrend: [...QUALITY_TREND_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): ConsultantQualityStoreState {
  const stored = readJson<ConsultantQualityStoreState>(STORAGE_KEY, defaultState());
  if (!stored?.reviews?.length) return defaultState();
  return {
    ...defaultState(),
    ...stored,
    reviews: stored.reviews.map(normalizeQualityReview),
    certifications: stored.certifications?.length ? stored.certifications : CONSULTANT_CERTIFICATION_SEED,
    improvementPlans: stored.improvementPlans?.length ? stored.improvementPlans : IMPROVEMENT_PLAN_SEED,
    coachingSessions: stored.coachingSessions?.length ? stored.coachingSessions : COACHING_SESSION_SEED,
    qualityTrend: stored.qualityTrend?.length ? stored.qualityTrend : QUALITY_TREND_SEED
  };
}

function saveState(state: ConsultantQualityStoreState): void {
  writeJson(STORAGE_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function logQualityAudit(action: QualityAuditActionId, detail: string, entityRef: string): void {
  appendAuditCenterEvent({
    actor: "consultant-quality",
    role: "Operations",
    action: "permissions-updates",
    entity: "permission",
    entityRef,
    result: "success",
    ipPlaceholder: "—",
    detail: `[${action}] ${detail}`
  });
}

export function listConsultantQualityStoreReviews() {
  return loadState().reviews;
}

export function listConsultantCertifications() {
  return loadState().certifications;
}

export function listImprovementPlans() {
  return loadState().improvementPlans;
}

export function listCoachingSessions() {
  return loadState().coachingSessions;
}

export function listQualityTrend() {
  return loadState().qualityTrend;
}

export function appendConsultantQualityReviewLog(
  reviewId: string,
  input: { actor: string; action: string; note: string }
): QualityReviewRecord | null {
  const state = loadState();
  const index = state.reviews.findIndex((item) => item.id === reviewId);
  if (index < 0) return null;

  const updated = appendQualityReviewLogEntry(state.reviews[index], input);
  state.reviews[index] = updated;
  saveState(state);
  logQualityAudit("review-completed", `${updated.reviewRef} — ${input.action}`, updated.reviewRef);
  return updated;
}

export function issueConsultantCertification(
  input: Omit<ConsultantCertificationRecord, "id" | "status"> & { id?: string }
): ConsultantCertificationRecord {
  const state = loadState();
  const record: ConsultantCertificationRecord = {
    id: input.id ?? `cert_${Date.now()}`,
    consultantRef: input.consultantRef,
    consultantName: input.consultantName,
    certificationLevel: input.certificationLevel,
    status: "active",
    issuedAt: input.issuedAt ?? new Date().toISOString(),
    expiresAt: input.expiresAt,
    issuedBy: input.issuedBy,
    notes: input.notes
  };
  state.certifications = [...state.certifications, record];
  saveState(state);
  logQualityAudit(
    "certification-issued",
    `${record.consultantName} — ${record.certificationLevel}`,
    record.consultantRef
  );
  return record;
}

export function suspendConsultantCertification(
  certificationId: string,
  actor: string,
  reason: string
): ConsultantCertificationRecord | null {
  const state = loadState();
  const index = state.certifications.findIndex((item) => item.id === certificationId);
  if (index < 0) return null;

  const current = state.certifications[index];
  const updated: ConsultantCertificationRecord = {
    ...current,
    status: "suspended",
    certificationLevel: "suspended",
    notes: reason ? `${current.notes ?? ""} Suspended by ${actor}: ${reason}`.trim() : current.notes
  };
  state.certifications[index] = updated;
  saveState(state);
  logQualityAudit("certification-suspended", `${updated.consultantName} — ${reason}`, updated.consultantRef);
  return updated;
}

export function assignConsultantImprovementPlan(
  input: Omit<ImprovementPlanRecord, "id" | "status" | "createdAt"> & { id?: string }
): ImprovementPlanRecord {
  const state = loadState();
  const record: ImprovementPlanRecord = {
    id: input.id ?? `plan_${Date.now()}`,
    planRef: input.planRef,
    consultantRef: input.consultantRef,
    consultantName: input.consultantName,
    reviewRef: input.reviewRef,
    status: "active",
    actions: input.actions,
    followUpReviewAt: input.followUpReviewAt,
    createdAt: new Date().toISOString()
  };
  state.improvementPlans = [...state.improvementPlans, record];
  saveState(state);
  logQualityAudit("improvement-plan-assigned", `${record.planRef} for ${record.consultantName}`, record.planRef);
  return record;
}

export function completeConsultantImprovementAction(
  planId: string,
  actionId: string
): ImprovementPlanRecord | null {
  const state = loadState();
  const planIndex = state.improvementPlans.findIndex((item) => item.id === planId);
  if (planIndex < 0) return null;

  const plan = state.improvementPlans[planIndex];
  const actions = plan.actions.map((item) =>
    item.id === actionId ? { ...item, status: "completed" as const } : item
  );
  const allComplete = actions.every((item) => item.status === "completed");
  const updated: ImprovementPlanRecord = {
    ...plan,
    actions,
    status: allComplete ? "completed" : plan.status,
    completedAt: allComplete ? new Date().toISOString() : plan.completedAt
  };
  state.improvementPlans[planIndex] = updated;
  saveState(state);
  logQualityAudit("improvement-action-completed", `${plan.planRef} — ${actionId}`, plan.planRef);
  return updated;
}

export function scheduleConsultantCoachingSession(
  input: Omit<CoachingSessionRecord, "id" | "status" | "sessionRef"> & {
    id?: string;
    sessionRef?: string;
  }
): CoachingSessionRecord {
  const state = loadState();
  const record: CoachingSessionRecord = {
    id: input.id ?? `coach_${Date.now()}`,
    sessionRef: input.sessionRef ?? `CS-${Date.now()}`,
    consultantRef: input.consultantRef,
    consultantName: input.consultantName,
    coachEmail: input.coachEmail,
    topic: input.topic,
    status: "scheduled",
    scheduledAt: input.scheduledAt,
    notes: input.notes
  };
  state.coachingSessions = [...state.coachingSessions, record];
  saveState(state);
  logQualityAudit("coaching-scheduled", `${record.sessionRef} — ${record.topic}`, record.sessionRef);
  return record;
}

export function completeConsultantCoachingSession(
  sessionId: string,
  notes?: string
): CoachingSessionRecord | null {
  const state = loadState();
  const index = state.coachingSessions.findIndex((item) => item.id === sessionId);
  if (index < 0) return null;

  const updated: CoachingSessionRecord = {
    ...state.coachingSessions[index],
    status: "completed",
    completedAt: new Date().toISOString(),
    notes: notes ?? state.coachingSessions[index].notes
  };
  state.coachingSessions[index] = updated;
  saveState(state);
  logQualityAudit("coaching-completed", `${updated.sessionRef} — ${updated.topic}`, updated.sessionRef);
  return updated;
}
