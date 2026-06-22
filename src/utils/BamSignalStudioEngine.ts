import { PREPARED_STUDIO_PRODUCTIONS } from "../constants/bamSignalStudio";
import {
  listArchitectureCreatorProductions,
  listArchitectureDocumentaryProductions,
  listArchitecturePodcastProductions,
  type CreatorStudioCardViewModel,
  type DocumentaryStudioCardViewModel,
  type PodcastStudioCardViewModel
} from "./bamSignalStudioLogic";

export type BamSignalStudioBundle = {
  podcastProductions: PodcastStudioCardViewModel[];
  documentaryProductions: DocumentaryStudioCardViewModel[];
  creatorProductions: CreatorStudioCardViewModel[];
  productionCount: number;
};

export function getBamSignalStudioBundle(): BamSignalStudioBundle {
  return {
    podcastProductions: listArchitecturePodcastProductions(),
    documentaryProductions: listArchitectureDocumentaryProductions(),
    creatorProductions: listArchitectureCreatorProductions(),
    productionCount: PREPARED_STUDIO_PRODUCTIONS.length
  };
}
