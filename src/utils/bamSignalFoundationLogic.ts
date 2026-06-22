import type { FoundationProgramDefinition, FoundationStorySeed } from "../constants/bamSignalFoundation";
import {
  FOUNDATION_PROGRAMS,
  FOUNDATION_STORIES_ARCHITECTURE_SEED
} from "../constants/bamSignalFoundation";

export type FoundationProgramViewModel = FoundationProgramDefinition & {
  statusLabel: string;
};

export type FoundationStoryViewModel = FoundationStorySeed & {
  visibilityLabel: string;
};

export function sortFoundationPrograms(
  programs: FoundationProgramViewModel[]
): FoundationProgramViewModel[] {
  return [...programs].sort((a, b) => a.title.localeCompare(b.title));
}

export function buildFoundationProgramViewModel(
  program: FoundationProgramDefinition
): FoundationProgramViewModel {
  return {
    ...program,
    statusLabel: "Architecture prepared — not enabled yet"
  };
}

export function listArchitectureFoundationPrograms(): FoundationProgramViewModel[] {
  return sortFoundationPrograms(FOUNDATION_PROGRAMS.map(buildFoundationProgramViewModel));
}

export function listArchitectureFoundationStories(): FoundationStoryViewModel[] {
  return [...FOUNDATION_STORIES_ARCHITECTURE_SEED]
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .map((story) => ({
      ...story,
      visibilityLabel: story.privateByDefault ? "Private by default" : "Consent required"
    }));
}

export function getFoundationProgramById(id: string): FoundationProgramViewModel | null {
  const program = FOUNDATION_PROGRAMS.find((entry) => entry.id === id);
  if (!program) return null;
  return buildFoundationProgramViewModel(program);
}
