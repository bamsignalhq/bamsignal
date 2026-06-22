import { COUPLE_HAPPINESS_AI_ENABLED } from "../constants/coupleHappinessNotes";
import type {
  AddCoupleHappinessNoteInput,
  CoupleHappinessNoteEntry,
  CoupleHappinessNotesRecord
} from "../types/coupleHappinessNotes";

const PRIVATE_VISIBILITY = "private-consultant-admin" as const;

export function normalizeCoupleHappinessNoteEntry(
  entry: CoupleHappinessNoteEntry
): CoupleHappinessNoteEntry {
  return {
    ...entry,
    visibility: PRIVATE_VISIBILITY,
    source: entry.source === "manual" ? "manual" : "manual"
  };
}

export function normalizeCoupleHappinessNotesRecord(
  record: CoupleHappinessNotesRecord
): CoupleHappinessNotesRecord {
  return {
    ...record,
    notes: record.notes.map((note) => normalizeCoupleHappinessNoteEntry(note)),
    futureReady: {
      aiSummaries: false,
      anniversaryBooks: false,
      legacyMemories: false
    }
  };
}

export function assertCoupleHappinessPrivacy(entry: CoupleHappinessNoteEntry): void {
  if (entry.visibility !== PRIVATE_VISIBILITY) {
    throw new Error("Couple happiness notes must remain private — never public");
  }
}

export function assertCoupleHappinessNotesIntegrity(
  previous: CoupleHappinessNotesRecord,
  next: CoupleHappinessNotesRecord
): void {
  if (next.journeyId !== previous.journeyId) {
    throw new Error("Couple happiness journeyId cannot change");
  }
  if (next.notes.length < previous.notes.length) {
    throw new Error("Couple happiness notes cannot shrink");
  }
  const previousIds = new Set(previous.notes.map((note) => note.id));
  for (const id of previousIds) {
    if (!next.notes.some((note) => note.id === id)) {
      throw new Error("Couple happiness notes are never deleted");
    }
  }
  for (const note of next.notes) {
    assertCoupleHappinessPrivacy(note);
  }
}

export function createCoupleHappinessNoteEntry(
  input: AddCoupleHappinessNoteInput & { id?: string; recordedAt?: string }
): CoupleHappinessNoteEntry {
  const entry: CoupleHappinessNoteEntry = {
    id: input.id ?? `chn_${Date.now().toString(36)}`,
    journeyId: input.journeyId,
    body: input.body.trim(),
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    recordedBy: input.recordedBy,
    visibility: PRIVATE_VISIBILITY,
    source: "manual"
  };
  assertCoupleHappinessPrivacy(entry);
  return entry;
}

export function appendCoupleHappinessNote(
  record: CoupleHappinessNotesRecord,
  input: AddCoupleHappinessNoteInput
): CoupleHappinessNotesRecord {
  if (!input.body.trim()) {
    throw new Error("Couple happiness note body is required");
  }
  if (COUPLE_HAPPINESS_AI_ENABLED) {
    throw new Error("AI note generation is not enabled");
  }

  const entry = createCoupleHappinessNoteEntry(input);
  const next: CoupleHappinessNotesRecord = {
    ...record,
    notes: [entry, ...record.notes],
    updatedAt: new Date().toISOString()
  };
  assertCoupleHappinessNotesIntegrity(record, next);
  return next;
}

export function sortCoupleHappinessNotes(notes: CoupleHappinessNoteEntry[]): CoupleHappinessNoteEntry[] {
  return [...notes].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );
}

export function latestCoupleHappinessNote(
  notes: CoupleHappinessNoteEntry[]
): CoupleHappinessNoteEntry | null {
  const sorted = sortCoupleHappinessNotes(notes);
  return sorted[0] ?? null;
}
