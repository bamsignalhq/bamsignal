import { TALENT_PIPELINE_STAGES } from "../constants/talentRecruiting";
import type { TalentCandidateRecord, TalentPipelineStageId } from "../types/talentRecruiting";

export function filterCandidatesByStage(
  candidates: TalentCandidateRecord[],
  stage: TalentPipelineStageId
): TalentCandidateRecord[] {
  return candidates.filter((candidate) => candidate.stage === stage);
}

export function sortCandidatesByAppliedAt(candidates: TalentCandidateRecord[]): TalentCandidateRecord[] {
  return [...candidates].sort(
    (left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime()
  );
}

export function countCandidatesByStage(
  candidates: TalentCandidateRecord[]
): Record<TalentPipelineStageId, number> {
  const counts = Object.fromEntries(
    TALENT_PIPELINE_STAGES.map((stage) => [stage.id, 0])
  ) as Record<TalentPipelineStageId, number>;

  for (const candidate of candidates) {
    counts[candidate.stage] = (counts[candidate.stage] ?? 0) + 1;
  }

  return counts;
}

export function findCandidateById(
  candidates: TalentCandidateRecord[],
  candidateId: string | null
): TalentCandidateRecord | null {
  if (!candidateId) return null;
  return candidates.find((candidate) => candidate.id === candidateId) ?? null;
}

export function moveCandidateStage(
  candidate: TalentCandidateRecord,
  stage: TalentPipelineStageId
): TalentCandidateRecord {
  return {
    ...candidate,
    stage,
    updatedAt: new Date().toISOString()
  };
}
