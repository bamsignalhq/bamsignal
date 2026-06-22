import type {
  JourneyMilestoneEntry,
  PreparedPremaritalModuleDefinition,
  PreparedPremaritalModuleId
} from "../constants/premaritalJourney";
import { PREPARED_PREMARITAL_MODULES } from "../constants/premaritalJourney";

export type PremaritalModuleViewModel = {
  id: PreparedPremaritalModuleId;
  title: string;
  description: string;
  order: number;
  statusLabel: string;
  milestones: JourneyMilestoneEntry[];
};

const ARCHITECTURE_STATUS = "Architecture prepared — not enabled yet";

function buildModuleMilestones(module: PreparedPremaritalModuleDefinition): JourneyMilestoneEntry[] {
  const base = new Date("2026-05-15T00:00:00.000Z").getTime();
  const steps = [
    { label: "Module architecture prepared", note: "Foundation building — not enabled yet." },
    { label: "Milestones defined", note: module.description },
    { label: "Journey step reserved", note: "Preparing for forever — no progress tracking yet." }
  ];
  return steps.map((step, index) => ({
    id: `pj_milestone_${module.id}_${index}`,
    moduleId: module.id,
    label: step.label,
    recordedAt: new Date(base + (module.order - 1) * 7 * 24 * 60 * 60 * 1000 + index * 24 * 60 * 60 * 1000).toISOString(),
    note: step.note
  }));
}

export function buildPremaritalModuleViewModel(
  module: PreparedPremaritalModuleDefinition
): PremaritalModuleViewModel {
  return {
    id: module.id,
    title: module.title,
    description: module.description,
    order: module.order,
    statusLabel: ARCHITECTURE_STATUS,
    milestones: buildModuleMilestones(module)
  };
}

export function sortPremaritalModules(
  modules: PremaritalModuleViewModel[]
): PremaritalModuleViewModel[] {
  return [...modules].sort((a, b) => a.order - b.order);
}

export function listArchitecturePremaritalModules(): PremaritalModuleViewModel[] {
  return sortPremaritalModules(PREPARED_PREMARITAL_MODULES.map(buildPremaritalModuleViewModel));
}
