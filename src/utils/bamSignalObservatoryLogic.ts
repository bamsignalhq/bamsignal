import type { ObservatorySectionDefinition, ObservatorySectionId } from "../constants/bamSignalObservatory";
import { OBSERVATORY_SECTIONS } from "../constants/bamSignalObservatory";

export type ObservatorySectionViewModel = {
  id: ObservatorySectionId;
  title: string;
  description: string;
  statusLabel: string;
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

export function buildObservatorySectionViewModel(
  section: ObservatorySectionDefinition
): ObservatorySectionViewModel {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    statusLabel: ARCHITECTURE_STATUS
  };
}

export function sortObservatorySections(
  sections: ObservatorySectionViewModel[]
): ObservatorySectionViewModel[] {
  return [...sections].sort((a, b) => a.title.localeCompare(b.title));
}

export function listArchitectureObservatorySections(): ObservatorySectionViewModel[] {
  return sortObservatorySections(OBSERVATORY_SECTIONS.map(buildObservatorySectionViewModel));
}

export function getObservatorySectionViewModel(
  sectionId: ObservatorySectionId
): ObservatorySectionViewModel | null {
  return listArchitectureObservatorySections().find((section) => section.id === sectionId) ?? null;
}
