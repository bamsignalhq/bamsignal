import {
  ACADEMY_METRICS,
  ACADEMY_MODULE_COUNT,
  ACADEMY_TRACKS,
  CERTIFICATION_LEVEL_LABELS,
  PROMOTION_READINESS_LABELS
} from "../constants/consultantAcademy";
import { CONSULTANT_ACADEMY_SEED } from "../data/consultantAcademySeed";
import type {
  AcademyFilterState,
  AcademyTrackSummary,
  ConsultantAcademyRecord
} from "../types/consultantAcademy";
import type { AcademyTrackId, CertificationLevelId } from "../constants/consultantAcademy";

export function listAcademyConsultants(): ConsultantAcademyRecord[] {
  return [...CONSULTANT_ACADEMY_SEED];
}

export function countCompletedModules(consultant: ConsultantAcademyRecord): number {
  return consultant.moduleProgress.filter((module) => module.status === "completed").length;
}

export function sumTrainingHours(consultant: ConsultantAcademyRecord): number {
  return consultant.moduleProgress.reduce((total, module) => total + module.hoursSpent, 0);
}

export function averageAssessmentScore(consultant: ConsultantAcademyRecord): number | null {
  if (!consultant.assessments.length) return null;
  const total = consultant.assessments.reduce((sum, assessment) => sum + assessment.score, 0);
  return Math.round(total / consultant.assessments.length);
}

export function sortConsultantsByName(consultants: ConsultantAcademyRecord[]): ConsultantAcademyRecord[] {
  return [...consultants].sort((left, right) => left.consultantName.localeCompare(right.consultantName));
}

export function findConsultantById(
  consultants: ConsultantAcademyRecord[],
  consultantId: string | null
): ConsultantAcademyRecord | null {
  if (!consultantId) return null;
  return consultants.find((consultant) => consultant.id === consultantId) ?? null;
}

export function filterAcademyConsultants(
  consultants: ConsultantAcademyRecord[],
  filters: AcademyFilterState
): ConsultantAcademyRecord[] {
  const query = filters.query.trim().toLowerCase();

  return consultants.filter((consultant) => {
    if (filters.trackId !== "all" && consultant.trackId !== filters.trackId) return false;
    if (filters.certificationLevel !== "all" && consultant.certificationLevel !== filters.certificationLevel) {
      return false;
    }
    if (!query) return true;

    const haystack = [consultant.consultantName, consultant.consultantRef, consultant.trackId]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function buildTrackSummaries(consultants: ConsultantAcademyRecord[]): AcademyTrackSummary[] {
  return ACADEMY_TRACKS.map((track) => ({
    trackId: track.id,
    hint: track.hint,
    consultantCount: consultants.filter((consultant) => consultant.trackId === track.id).length
  }));
}

export function countPromotionReady(consultants: ConsultantAcademyRecord[]): number {
  return consultants.filter((consultant) => consultant.promotionReadiness === "ready").length;
}

export function buildAcademyMetrics(consultants: ConsultantAcademyRecord[]) {
  const totalCompleted = consultants.reduce(
    (sum, consultant) => sum + countCompletedModules(consultant),
    0
  );
  const totalHours = consultants.reduce((sum, consultant) => sum + sumTrainingHours(consultant), 0);
  const scores = consultants
    .map((consultant) => averageAssessmentScore(consultant))
    .filter((score): score is number => score !== null);
  const avgScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : null;
  const certifiedCount = consultants.filter(
    (consultant) => consultant.certificationLevel !== "trainee"
  ).length;

  const values: Record<string, string> = {
    "modules-completed": `${totalCompleted} / ${consultants.length * ACADEMY_MODULE_COUNT}`,
    "certification-status": `${certifiedCount} certified`,
    "training-hours": `${totalHours}h`,
    "assessment-scores": avgScore === null ? "—" : `${avgScore}% avg`,
    "promotion-readiness": `${countPromotionReady(consultants)} ready`
  };

  return ACADEMY_METRICS.map((metric) => ({
    id: metric.id,
    label: metric.label,
    value: values[metric.id] ?? "0",
    numericValue: Number(values[metric.id]) || undefined
  }));
}

export function emptyAcademyFilters(): AcademyFilterState {
  return {
    query: "",
    trackId: "all",
    certificationLevel: "all"
  };
}

export function certificationLabel(level: CertificationLevelId): string {
  return CERTIFICATION_LEVEL_LABELS[level];
}

export function promotionReadinessLabel(readiness: ConsultantAcademyRecord["promotionReadiness"]): string {
  return PROMOTION_READINESS_LABELS[readiness];
}

export function countByTrack(consultants: ConsultantAcademyRecord[], trackId: AcademyTrackId): number {
  return consultants.filter((consultant) => consultant.trackId === trackId).length;
}
