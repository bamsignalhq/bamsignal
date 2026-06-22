import { COUPLE_HAPPINESS_NOTES_SEED } from "../data/coupleHappinessNotesSeed";
import type {
  AddCoupleHappinessNoteInput,
  CoupleHappinessNoteEntry,
  CoupleHappinessNotesRecord
} from "../types/coupleHappinessNotes";
import {
  appendCoupleHappinessNote,
  latestCoupleHappinessNote,
  normalizeCoupleHappinessNotesRecord,
  sortCoupleHappinessNotes
} from "./coupleHappinessNotesLogic";
import { readJson, writeJson } from "./storage";

const STORE_KEY = "bamsignal-concierge-couple-happiness-notes-store";

type CoupleHappinessNotesStore = {
  records: CoupleHappinessNotesRecord[];
  updatedAt: string;
};

function loadStore(): CoupleHappinessNotesStore {
  const stored = readJson<CoupleHappinessNotesStore | null>(STORE_KEY, null);
  if (stored?.records?.length) {
    return {
      ...stored,
      records: stored.records.map((record) => normalizeCoupleHappinessNotesRecord(record))
    };
  }
  const initial: CoupleHappinessNotesStore = {
    records: COUPLE_HAPPINESS_NOTES_SEED.map((record) => normalizeCoupleHappinessNotesRecord(record)),
    updatedAt: new Date().toISOString()
  };
  writeJson(STORE_KEY, initial);
  return initial;
}

function saveStore(store: CoupleHappinessNotesStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function emptyRecord(journeyId: string): CoupleHappinessNotesRecord {
  return {
    journeyId,
    notes: [],
    updatedAt: new Date().toISOString(),
    futureReady: {
      aiSummaries: false,
      anniversaryBooks: false,
      legacyMemories: false
    }
  };
}

export function listCoupleHappinessNotesRecords(): CoupleHappinessNotesRecord[] {
  return loadStore().records;
}

export function getCoupleHappinessNotesRecord(journeyId: string): CoupleHappinessNotesRecord {
  return (
    listCoupleHappinessNotesRecords().find((record) => record.journeyId === journeyId) ??
    emptyRecord(journeyId)
  );
}

export function saveCoupleHappinessNotesRecord(
  record: CoupleHappinessNotesRecord
): CoupleHappinessNotesRecord {
  const store = loadStore();
  const normalized = normalizeCoupleHappinessNotesRecord(record);
  const index = store.records.findIndex((item) => item.journeyId === normalized.journeyId);

  if (index >= 0) store.records[index] = normalized;
  else store.records.unshift(normalized);
  saveStore(store);
  return normalized;
}

export function addCoupleHappinessNoteToStore(
  input: AddCoupleHappinessNoteInput
): CoupleHappinessNoteEntry {
  const existing = getCoupleHappinessNotesRecord(input.journeyId);
  const updated = appendCoupleHappinessNote(existing, input);
  saveCoupleHappinessNotesRecord(updated);
  return updated.notes[0];
}

export function listCoupleHappinessNotesForJourney(journeyId: string): CoupleHappinessNoteEntry[] {
  return sortCoupleHappinessNotes(getCoupleHappinessNotesRecord(journeyId).notes);
}

export function getLatestCoupleHappinessNote(journeyId: string): CoupleHappinessNoteEntry | null {
  return latestCoupleHappinessNote(getCoupleHappinessNotesRecord(journeyId).notes);
}
