import type {
  PathMilestoneEntry,
  PreparedLearningPathDefinition,
  PreparedLearningPathId
} from "../constants/learningPaths";
import { PREPARED_LEARNING_PATHS } from "../constants/learningPaths";

export type LearningPathJourneyViewModel = {
  id: PreparedLearningPathId;
  title: string;
  description: string;
  statusLabel: string;
  milestones: PathMilestoneEntry[];
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function buildPathMilestones(path: PreparedLearningPathDefinition): PathMilestoneEntry[] {
  const base = new Date("2026-05-01T00:00:00.000Z").getTime();
  const steps = [
    { label: "Path architecture prepared", note: "Guided journey — not enabled yet." },
    { label: "Milestones defined", note: path.description },
    { label: "Learning pathway reserved", note: "No progress tracking yet." }
  ];
  return steps.map((step, index) => ({
    id: `lp_milestone_${path.id}_${index}`,
    pathId: path.id,
    label: step.label,
    recordedAt: new Date(base + index * 40 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildLearningPathJourneyViewModel(
  path: PreparedLearningPathDefinition
): LearningPathJourneyViewModel {
  return {
    id: path.id,
    title: path.title,
    description: path.description,
    statusLabel: ARCHITECTURE_STATUS,
    milestones: buildPathMilestones(path)
  };
}

export function sortLearningPaths(
  paths: LearningPathJourneyViewModel[]
): LearningPathJourneyViewModel[] {
  return [...paths].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureLearningPaths(): LearningPathJourneyViewModel[] {
  return sortLearningPaths(PREPARED_LEARNING_PATHS.map(buildLearningPathJourneyViewModel));
}
