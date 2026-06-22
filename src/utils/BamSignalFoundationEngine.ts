import { FOUNDATION_IMPACT_PILLARS } from "../constants/bamSignalFoundation";
import {
  listArchitectureFoundationPrograms,
  listArchitectureFoundationStories,
  type FoundationProgramViewModel,
  type FoundationStoryViewModel
} from "./bamSignalFoundationLogic";

export type BamSignalFoundationBundle = {
  programs: FoundationProgramViewModel[];
  stories: FoundationStoryViewModel[];
  impactPillars: typeof FOUNDATION_IMPACT_PILLARS;
};

export function getBamSignalFoundationBundle(): BamSignalFoundationBundle {
  return {
    programs: listArchitectureFoundationPrograms(),
    stories: listArchitectureFoundationStories(),
    impactPillars: FOUNDATION_IMPACT_PILLARS
  };
}
