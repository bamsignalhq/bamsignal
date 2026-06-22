import type { ResearchAreaDefinition, ResearchReportSeed } from "../constants/bamSignalInstitute";
import { RESEARCH_AREAS, RESEARCH_REPORTS_ARCHITECTURE_SEED } from "../constants/bamSignalInstitute";

export type ResearchAreaViewModel = ResearchAreaDefinition & {
  statusLabel: string;
};

export type ResearchReportViewModel = ResearchReportSeed & {
  areaTitle: string;
  visibilityLabel: string;
};

export function sortResearchAreas(areas: ResearchAreaViewModel[]): ResearchAreaViewModel[] {
  return [...areas].sort((a, b) => a.title.localeCompare(b.title));
}

export function buildResearchAreaViewModel(area: ResearchAreaDefinition): ResearchAreaViewModel {
  return {
    ...area,
    statusLabel: "Architecture prepared — not enabled yet"
  };
}

export function listArchitectureResearchAreas(): ResearchAreaViewModel[] {
  return sortResearchAreas(RESEARCH_AREAS.map(buildResearchAreaViewModel));
}

export function listArchitectureResearchReports(): ResearchReportViewModel[] {
  return [...RESEARCH_REPORTS_ARCHITECTURE_SEED]
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
    .map((report) => {
      const area = RESEARCH_AREAS.find((entry) => entry.id === report.areaId);
      return {
        ...report,
        areaTitle: area?.title ?? report.areaId,
        visibilityLabel: report.privateByDefault ? "Private by default" : "Consent required"
      };
    });
}
