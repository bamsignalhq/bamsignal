import { CONSULTANT_ACADEMY_SEED } from "../data/consultantAcademySeed";
import type { AcademyFilterState, ConsultantAcademyBundle } from "../types/consultantAcademy";
import {
  buildAcademyMetrics,
  buildTrackSummaries,
  emptyAcademyFilters,
  filterAcademyConsultants,
  findConsultantById,
  listAcademyConsultants,
  sortConsultantsByName
} from "./consultantAcademyLogic";
import { readJson } from "./storage";

const STORAGE_KEY = "bamsignal.consultantAcademy.v1";

type ConsultantAcademyState = {
  consultants: typeof CONSULTANT_ACADEMY_SEED;
  updatedAt: string;
};

function defaultState(): ConsultantAcademyState {
  return {
    consultants: [...CONSULTANT_ACADEMY_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): ConsultantAcademyState {
  const stored = readJson<ConsultantAcademyState>(STORAGE_KEY, defaultState());
  if (!stored?.consultants?.length) return defaultState();
  return stored;
}

export function listConsultantAcademyRecords() {
  return loadState().consultants;
}

export function buildConsultantAcademyBundle(
  filters: AcademyFilterState = emptyAcademyFilters(),
  selectedConsultantId?: string | null
): ConsultantAcademyBundle {
  const allConsultants = listConsultantAcademyRecords();
  const consultants = sortConsultantsByName(filterAcademyConsultants(allConsultants, filters));

  return {
    generatedAt: new Date().toISOString(),
    metrics: buildAcademyMetrics(allConsultants),
    tracks: buildTrackSummaries(allConsultants),
    consultants,
    selectedConsultant: findConsultantById(consultants, selectedConsultantId ?? null)
  };
}
