import { PREPARED_LEARNING_PATHS } from "../constants/learningPaths";
import {
  listArchitectureLearningPaths,
  type LearningPathJourneyViewModel
} from "./learningPathsLogic";

export type LearningPathsBundle = {
  paths: LearningPathJourneyViewModel[];
  pathCount: number;
};

export function getLearningPathsBundle(): LearningPathsBundle {
  return {
    paths: listArchitectureLearningPaths(),
    pathCount: PREPARED_LEARNING_PATHS.length
  };
}

export function getLearningPathJourney(pathId: string): LearningPathJourneyViewModel | null {
  return listArchitectureLearningPaths().find((path) => path.id === pathId) ?? null;
}
