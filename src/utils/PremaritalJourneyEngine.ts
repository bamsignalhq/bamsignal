import { PREPARED_PREMARITAL_MODULES } from "../constants/premaritalJourney";
import {
  listArchitecturePremaritalModules,
  type PremaritalModuleViewModel
} from "./premaritalJourneyLogic";

export type PremaritalJourneyBundle = {
  modules: PremaritalModuleViewModel[];
  moduleCount: number;
};

export function getPremaritalJourneyBundle(): PremaritalJourneyBundle {
  return {
    modules: listArchitecturePremaritalModules(),
    moduleCount: PREPARED_PREMARITAL_MODULES.length
  };
}

export function getPremaritalModule(moduleId: string): PremaritalModuleViewModel | null {
  return listArchitecturePremaritalModules().find((module) => module.id === moduleId) ?? null;
}
