import { OBSERVATORY_SECTIONS } from "../constants/bamSignalObservatory";
import {
  getObservatorySectionViewModel,
  listArchitectureObservatorySections,
  type ObservatorySectionViewModel
} from "./bamSignalObservatoryLogic";

export type BamSignalObservatoryBundle = {
  sections: ObservatorySectionViewModel[];
  relationshipDashboard: ObservatorySectionViewModel | null;
  marriageTrends: ObservatorySectionViewModel | null;
  communityGrowth: ObservatorySectionViewModel | null;
  legacyFamilies: ObservatorySectionViewModel | null;
  diasporaCorridors: ObservatorySectionViewModel | null;
  annualReports: ObservatorySectionViewModel | null;
  sectionCount: number;
};

export function getBamSignalObservatoryBundle(): BamSignalObservatoryBundle {
  return {
    sections: listArchitectureObservatorySections(),
    relationshipDashboard: getObservatorySectionViewModel("relationship-dashboard"),
    marriageTrends: getObservatorySectionViewModel("marriage-trends"),
    communityGrowth: getObservatorySectionViewModel("community-growth"),
    legacyFamilies: getObservatorySectionViewModel("legacy-families"),
    diasporaCorridors: getObservatorySectionViewModel("diaspora-corridors"),
    annualReports: getObservatorySectionViewModel("annual-reports"),
    sectionCount: OBSERVATORY_SECTIONS.length
  };
}
