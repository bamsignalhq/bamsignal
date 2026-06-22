import type { CareerCategoryId } from "../constants/careers";

export type TalentPipelineStageId =
  | "applications"
  | "screening"
  | "interviews"
  | "offers"
  | "hired"
  | "rejected"
  | "talent-pool";

export type TalentCandidateRecord = {
  id: string;
  name: string;
  email: string;
  roleSlug: string;
  roleTitle: string;
  categoryId: CareerCategoryId;
  stage: TalentPipelineStageId;
  location: string;
  appliedAt: string;
  updatedAt: string;
  source: string;
  note: string;
  starred: boolean;
};

export type TalentPipelineBucket = {
  stage: TalentPipelineStageId;
  label: string;
  candidates: TalentCandidateRecord[];
};

export type TalentRecruitingBundle = {
  generatedAt: string;
  metrics: {
    id: TalentPipelineStageId | "total";
    label: string;
    count: number;
  }[];
  pipeline: TalentPipelineBucket[];
  talentPool: TalentCandidateRecord[];
  selectedCandidate: TalentCandidateRecord | null;
};
