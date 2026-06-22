import type {
  PartnershipTimelineEntry,
  PreparedInstitutionDefinition,
  PreparedInstitutionId
} from "../constants/researchPartnerships";
import {
  PARTNER_CATEGORIES,
  PREPARED_INSTITUTIONS,
  getPartnerCategory
} from "../constants/researchPartnerships";

export type InstitutionViewModel = {
  id: PreparedInstitutionId;
  name: string;
  description: string;
  categoryLabel: string;
  statusLabel: string;
  timeline: PartnershipTimelineEntry[];
};

function buildPartnershipTimeline(institution: PreparedInstitutionDefinition): PartnershipTimelineEntry[] {
  const base = new Date("2026-05-01T00:00:00.000Z").getTime();
  const steps = [
    { label: "Partnership architecture prepared", note: "Institutional relationship — not enabled yet." },
    { label: "Collaboration framing defined", note: institution.description },
    { label: "Institutional pathway reserved", note: "Never sponsors or affiliates." }
  ];
  return steps.map((step, index) => ({
    id: `rp_timeline_${institution.id}_${index}`,
    institutionId: institution.id,
    label: step.label,
    recordedAt: new Date(base + index * 35 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildInstitutionViewModel(institution: PreparedInstitutionDefinition): InstitutionViewModel {
  const category = getPartnerCategory(institution.categoryId);
  return {
    id: institution.id,
    name: institution.name,
    description: institution.description,
    categoryLabel: category?.label ?? institution.categoryId,
    statusLabel: "Architecture prepared — not enabled yet",
    timeline: buildPartnershipTimeline(institution)
  };
}

export function sortInstitutions(institutions: InstitutionViewModel[]): InstitutionViewModel[] {
  return [...institutions].sort((a, b) => a.name.localeCompare(b.name));
}

export function listArchitectureInstitutions(): InstitutionViewModel[] {
  return sortInstitutions(PREPARED_INSTITUTIONS.map(buildInstitutionViewModel));
}

export function listPartnerCategories() {
  return PARTNER_CATEGORIES;
}
