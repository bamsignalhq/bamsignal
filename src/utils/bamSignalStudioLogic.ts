import type {
  PreparedStudioProductionDefinition,
  PreparedStudioProductionId
} from "../constants/bamSignalStudio";
import {
  CREATOR_STUDIO_LABEL,
  DOCUMENTARY_STUDIO_LABEL,
  PODCAST_STUDIO_LABEL,
  PREPARED_STUDIO_PRODUCTIONS
} from "../constants/bamSignalStudio";

export type PodcastStudioCardViewModel = {
  id: PreparedStudioProductionId;
  title: string;
  description: string;
  studioLabel: string;
  statusLabel: string;
};

export type DocumentaryStudioCardViewModel = {
  id: PreparedStudioProductionId;
  title: string;
  description: string;
  studioLabel: string;
  statusLabel: string;
};

export type CreatorStudioCardViewModel = {
  id: PreparedStudioProductionId;
  title: string;
  description: string;
  studioLabel: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildPodcastStudioCardViewModel(
  production: PreparedStudioProductionDefinition
): PodcastStudioCardViewModel {
  return {
    id: production.id,
    title: production.title,
    description: production.description,
    studioLabel: PODCAST_STUDIO_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildDocumentaryStudioCardViewModel(
  production: PreparedStudioProductionDefinition
): DocumentaryStudioCardViewModel {
  return {
    id: production.id,
    title: production.title,
    description: production.description,
    studioLabel: DOCUMENTARY_STUDIO_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function buildCreatorStudioCardViewModel(
  production: PreparedStudioProductionDefinition
): CreatorStudioCardViewModel {
  return {
    id: production.id,
    title: production.title,
    description: production.description,
    studioLabel: CREATOR_STUDIO_LABEL,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function listArchitecturePodcastProductions(): PodcastStudioCardViewModel[] {
  return PREPARED_STUDIO_PRODUCTIONS.filter((production) => production.kind === "podcast").map(
    buildPodcastStudioCardViewModel
  );
}

export function listArchitectureDocumentaryProductions(): DocumentaryStudioCardViewModel[] {
  return PREPARED_STUDIO_PRODUCTIONS.filter((production) => production.kind === "documentary").map(
    buildDocumentaryStudioCardViewModel
  );
}

export function listArchitectureCreatorProductions(): CreatorStudioCardViewModel[] {
  return PREPARED_STUDIO_PRODUCTIONS.filter((production) => production.kind === "creator").map(
    buildCreatorStudioCardViewModel
  );
}
