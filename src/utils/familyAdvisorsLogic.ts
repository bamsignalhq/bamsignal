import type {
  AdvisorTimelineEntry,
  PreparedFamilyAdvisorDefinition,
  PreparedFamilyAdvisorId,
  PreparedFamilyAdvisorSpecialtyDefinition
} from "../constants/familyAdvisors";
import { PREPARED_FAMILY_ADVISOR_SPECIALTIES, PREPARED_FAMILY_ADVISORS } from "../constants/familyAdvisors";

export type AdvisorProfileViewModel = {
  id: PreparedFamilyAdvisorId;
  name: string;
  title: string;
  focus: string;
  specialtyTitle: string;
  statusLabel: string;
  timeline: AdvisorTimelineEntry[];
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function buildAdvisorTimeline(advisor: PreparedFamilyAdvisorDefinition): AdvisorTimelineEntry[] {
  const base = new Date("2026-06-25T00:00:00.000Z").getTime();
  const steps = [
    { label: "Advisor architecture prepared", note: "Family advisors — not live yet." },
    { label: "Specialty defined", note: advisor.focus },
    { label: "Advisor timeline reserved", note: "No profiles or booking yet." }
  ];
  return steps.map((step, index) => ({
    id: `fadv_timeline_${advisor.id}_${index}`,
    advisorId: advisor.id,
    label: step.label,
    recordedAt: new Date(base + index * 20 * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildAdvisorProfileViewModel(
  advisor: PreparedFamilyAdvisorDefinition
): AdvisorProfileViewModel {
  const specialty = PREPARED_FAMILY_ADVISOR_SPECIALTIES.find(
    (item) => item.id === advisor.specialtyId
  );
  return {
    id: advisor.id,
    name: advisor.name,
    title: advisor.title,
    focus: advisor.focus,
    specialtyTitle: specialty?.title ?? advisor.specialtyId,
    statusLabel: ARCHITECTURE_STATUS,
    timeline: buildAdvisorTimeline(advisor)
  };
}

export function listArchitectureAdvisorProfiles(): AdvisorProfileViewModel[] {
  return [...PREPARED_FAMILY_ADVISORS.map(buildAdvisorProfileViewModel)].sort((a, b) =>
    a.specialtyTitle.localeCompare(b.specialtyTitle)
  );
}

export function listArchitectureAdvisorSpecialties(): PreparedFamilyAdvisorSpecialtyDefinition[] {
  return [...PREPARED_FAMILY_ADVISOR_SPECIALTIES].sort((a, b) => a.title.localeCompare(b.title));
}
