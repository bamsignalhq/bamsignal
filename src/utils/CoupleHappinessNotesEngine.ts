import { COUPLE_HAPPINESS_FUTURE_CAPABILITIES } from "../constants/coupleHappinessNotes";
import type { AddCoupleHappinessNoteInput, CoupleHappinessNoteEntry } from "../types/coupleHappinessNotes";
import {
  addCoupleHappinessNoteToStore,
  getLatestCoupleHappinessNote,
  getCoupleHappinessNotesRecord,
  listCoupleHappinessNotesForJourney,
  listCoupleHappinessNotesRecords
} from "./coupleHappinessNotesStore";

export function listCoupleHappinessFutureCapabilities() {
  return COUPLE_HAPPINESS_FUTURE_CAPABILITIES;
}

export function addCoupleHappinessNote(input: AddCoupleHappinessNoteInput): CoupleHappinessNoteEntry {
  return addCoupleHappinessNoteToStore(input);
}

export function getCoupleHappinessNotes(journeyId: string): CoupleHappinessNoteEntry[] {
  return listCoupleHappinessNotesForJourney(journeyId);
}

export function getCoupleHappinessMemory(journeyId: string): CoupleHappinessNoteEntry | null {
  return getLatestCoupleHappinessNote(journeyId);
}

export function getCoupleHappinessJourneyRecord(journeyId: string) {
  return getCoupleHappinessNotesRecord(journeyId);
}

export function listCoupleHappinessJourneyRecords() {
  return listCoupleHappinessNotesRecords();
}
