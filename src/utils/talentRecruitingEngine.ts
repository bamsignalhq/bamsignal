import { TALENT_CANDIDATES_SEED } from "../data/talentRecruitingSeed";
import { TALENT_PIPELINE_STAGES } from "../constants/talentRecruiting";
import type { TalentCandidateRecord, TalentRecruitingBundle } from "../types/talentRecruiting";
import {
  countCandidatesByStage,
  filterCandidatesByStage,
  findCandidateById,
  moveCandidateStage,
  sortCandidatesByAppliedAt
} from "./talentRecruitingLogic";
import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "bamsignal.talentRecruiting.v1";

type TalentRecruitingState = {
  candidates: TalentCandidateRecord[];
  updatedAt: string;
};

function defaultState(): TalentRecruitingState {
  return {
    candidates: [...TALENT_CANDIDATES_SEED],
    updatedAt: new Date().toISOString()
  };
}

function loadState(): TalentRecruitingState {
  const stored = readJson<TalentRecruitingState>(STORAGE_KEY, defaultState());
  if (!stored?.candidates?.length) return defaultState();
  return stored;
}

function saveState(state: TalentRecruitingState): void {
  writeJson(STORAGE_KEY, state);
}

export function listTalentCandidates(): TalentCandidateRecord[] {
  return loadState().candidates;
}

export function updateTalentCandidateStage(
  candidateId: string,
  stage: TalentCandidateRecord["stage"]
): TalentCandidateRecord | null {
  const state = loadState();
  const index = state.candidates.findIndex((candidate) => candidate.id === candidateId);
  if (index < 0) return null;

  const next = moveCandidateStage(state.candidates[index], stage);
  state.candidates[index] = next;
  state.updatedAt = new Date().toISOString();
  saveState(state);
  return next;
}

export function buildTalentRecruitingBundle(selectedCandidateId?: string | null): TalentRecruitingBundle {
  const candidates = sortCandidatesByAppliedAt(listTalentCandidates());
  const counts = countCandidatesByStage(candidates);

  const metrics = [
    { id: "total" as const, label: "Total candidates", count: candidates.length },
    ...TALENT_PIPELINE_STAGES.map((stage) => ({
      id: stage.id,
      label: stage.label,
      count: counts[stage.id] ?? 0
    }))
  ];

  const pipeline = TALENT_PIPELINE_STAGES.map((stage) => ({
    stage: stage.id,
    label: stage.label,
    candidates: sortCandidatesByAppliedAt(filterCandidatesByStage(candidates, stage.id))
  }));

  const talentPool = sortCandidatesByAppliedAt(filterCandidatesByStage(candidates, "talent-pool"));

  return {
    generatedAt: new Date().toISOString(),
    metrics,
    pipeline,
    talentPool,
    selectedCandidate: findCandidateById(candidates, selectedCandidateId ?? null)
  };
}
