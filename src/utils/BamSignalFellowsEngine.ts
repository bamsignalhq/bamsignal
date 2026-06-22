import { PREPARED_FELLOW_SPECIALTIES } from "../constants/bamSignalFellows";
import { listArchitectureFellows, type FellowViewModel } from "./bamSignalFellowsLogic";

export type BamSignalFellowsBundle = {
  fellows: FellowViewModel[];
  specialtyCount: number;
};

export function getBamSignalFellowsBundle(): BamSignalFellowsBundle {
  return {
    fellows: listArchitectureFellows(),
    specialtyCount: PREPARED_FELLOW_SPECIALTIES.length
  };
}

export function getFellow(fellowId: string): FellowViewModel | null {
  return listArchitectureFellows().find((fellow) => fellow.id === fellowId) ?? null;
}
