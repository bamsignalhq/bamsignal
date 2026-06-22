import {
  formatMeetingNoteId,
  isValidMeetingNoteId,
  meetingNoteIdYearFromDate,
  normalizeMeetingNoteId,
  parseMeetingNoteId
} from "../constants/meetingNotes";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { MeetingNote, MemberMeetingNotesBundle } from "../types/meetingNotes";
import { listConciergeMembers } from "./conciergeConsultantStore";
import {
  buildMemberMeetingNotesBundle,
  deriveMeetingNotesFromMember
} from "./meetingNotesLogic";
import { readJson, writeJson } from "./storage";

type MeetingNoteRegistryState = {
  byNoteId: Record<string, string>;
  byRecordId: Record<string, string>;
  yearSequence: Record<number, number>;
  updatedAt: string;
};

type MeetingNotesStore = {
  notes: Record<string, MeetingNote>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeMeetingNotesStore;
const REGISTRY_KEY = STORAGE_KEYS.conciergeMeetingNotesRegistry;

function loadRegistry(): MeetingNoteRegistryState {
  return readJson<MeetingNoteRegistryState>(REGISTRY_KEY, {
    byNoteId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}

function saveRegistry(state: MeetingNoteRegistryState): void {
  writeJson(REGISTRY_KEY, { ...state, updatedAt: new Date().toISOString() });
}

function loadStore(): MeetingNotesStore {
  return readJson<MeetingNotesStore>(STORE_KEY, {
    notes: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: MeetingNotesStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function assignNoteId(recordId: string, createdAt: string): string {
  const state = loadRegistry();
  const existing = state.byRecordId[recordId];
  if (existing) return existing;

  const year = meetingNoteIdYearFromDate(createdAt);
  const nextSequence = (state.yearSequence[year] ?? 0) + 1;
  const noteId = formatMeetingNoteId(year, nextSequence);

  if (state.byNoteId[noteId]) {
    throw new Error(`Meeting note ID already allocated: ${noteId}`);
  }

  saveRegistry({
    ...state,
    byNoteId: { ...state.byNoteId, [noteId]: recordId },
    byRecordId: { ...state.byRecordId, [recordId]: noteId },
    yearSequence: { ...state.yearSequence, [year]: nextSequence }
  });
  return noteId;
}

function registerExistingNoteId(input: {
  recordId: string;
  noteId: string;
  createdAt: string;
}): void {
  const normalized = normalizeMeetingNoteId(input.noteId);
  if (!isValidMeetingNoteId(normalized)) return;

  const state = loadRegistry();
  if (state.byNoteId[normalized]) return;

  const parsed = parseMeetingNoteId(normalized);
  const year = parsed ? parsed.year : meetingNoteIdYearFromDate(input.createdAt);
  const sequence = parsed ? parsed.sequence : 1;

  saveRegistry({
    ...state,
    byNoteId: { ...state.byNoteId, [normalized]: input.recordId },
    byRecordId: { ...state.byRecordId, [input.recordId]: normalized },
    yearSequence: {
      ...state.yearSequence,
      [year]: Math.max(state.yearSequence[year] ?? 0, sequence)
    }
  });
}

function ensureNoteId(recordId: string, at: string, existing?: string): string {
  if (existing && isValidMeetingNoteId(existing)) {
    registerExistingNoteId({ recordId, noteId: existing, createdAt: at });
    return normalizeMeetingNoteId(existing);
  }
  return assignNoteId(recordId, at);
}

function syncMemberMeetingNotes(member: ConciergeMemberRecord, store: MeetingNotesStore): MeetingNote[] {
  const assigner = (recordId: string, at: string) =>
    ensureNoteId(recordId, at, store.notes[recordId]?.noteId);

  return deriveMeetingNotesFromMember(member, assigner, store.notes);
}

export function syncMeetingNotesFromMembers(): MeetingNote[] {
  const members = listConciergeMembers();
  const store = loadStore();
  const notes = { ...store.notes };

  for (const member of members) {
    for (const note of syncMemberMeetingNotes(member, store)) {
      notes[note.id] = note;
    }
  }

  saveStore({ notes, updatedAt: new Date().toISOString() });
  return Object.values(notes).sort((a, b) => Date.parse(b.heldAt) - Date.parse(a.heldAt));
}

export function ensureMemberMeetingNotesBundle(member: ConciergeMemberRecord): MemberMeetingNotesBundle {
  const store = loadStore();
  const synced = syncMemberMeetingNotes(member, store);
  const notes = { ...store.notes };
  for (const note of synced) {
    notes[note.id] = note;
  }
  saveStore({ notes, updatedAt: new Date().toISOString() });
  return buildMemberMeetingNotesBundle(member, synced);
}

export function listMeetingNotesForMember(memberId: string): MeetingNote[] {
  const store = loadStore();
  return Object.values(store.notes)
    .filter((note) => note.memberId === memberId)
    .sort((a, b) => Date.parse(b.heldAt) - Date.parse(a.heldAt));
}

export function appendMeetingNote(note: MeetingNote): MeetingNote {
  const store = loadStore();
  const existing = store.notes[note.id];
  const next = existing
    ? {
        ...existing,
        observations: [...existing.observations, ...note.observations],
        recommendations: [...existing.recommendations, ...note.recommendations],
        actionItems: [...existing.actionItems, ...note.actionItems],
        narrative: note.narrative || existing.narrative
      }
    : note;

  saveStore({
    notes: { ...store.notes, [note.id]: next },
    updatedAt: new Date().toISOString()
  });
  return next;
}

export function resetMeetingNotesStoreForTests(): void {
  writeJson(STORE_KEY, { notes: {}, updatedAt: new Date().toISOString() });
  writeJson(REGISTRY_KEY, {
    byNoteId: {},
    byRecordId: {},
    yearSequence: {},
    updatedAt: new Date().toISOString()
  });
}
