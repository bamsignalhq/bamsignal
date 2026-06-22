import type {
  MeetingNoteType,
  MeetingNoteVisibility,
  MeetingNotesFutureCapability
} from "../types/meetingNotes";

export const MEETING_NOTES_SYSTEM_BRAND = "Meeting Notes System™";

export const MEETING_NOTE_VISIBILITY: MeetingNoteVisibility = "consultant-admin";

export const MEETING_NOTE_PRIVACY_COPY =
  "Private consultant-admin memory — never public, never shared outside stewardship.";

/** Permanent Meeting Note IDs — BS-MN-YYYY-#### */
export const MEETING_NOTE_ID_PREFIX = "BS-MN";
export const MEETING_NOTE_ID_PATTERN = /^BS-MN-\d{4}-\d{4}$/;
export const MEETING_NOTE_ID_LABEL = "Note ID";

export const MEETING_NOTE_TYPES: { id: MeetingNoteType; label: string; hint: string }[] = [
  { id: "consultation", label: "Consultation", hint: "Private consultation conversation." },
  { id: "application-review", label: "Application Review", hint: "Steward review of application depth." },
  { id: "follow-up", label: "Follow-Up", hint: "Continuity call or check-in." },
  { id: "introduction-review", label: "Introduction Review", hint: "Post-introduction reflection." },
  { id: "relationship-support", label: "Relationship Support", hint: "Active relationship stewardship." },
  { id: "marriage-celebration", label: "Marriage Celebration", hint: "Journey milestone celebration." },
  { id: "legacy-archive", label: "Legacy Archive", hint: "Permanent archive consultation." }
];

export const MEETING_NOTE_TYPE_LABELS: Record<MeetingNoteType, string> = Object.fromEntries(
  MEETING_NOTE_TYPES.map((type) => [type.id, type.label])
) as Record<MeetingNoteType, string>;

export const MEETING_NOTES_APPEND_ONLY_RULE =
  "Append-only — no deletion, no shrinking. Preserve journey memory.";

export const MEETING_NOTES_FUTURE_CAPABILITIES: {
  id: MeetingNotesFutureCapability;
  label: string;
}[] = [
  { id: "ai-summaries", label: "AI summaries" },
  { id: "voice-transcription", label: "Voice transcription" },
  { id: "attachments", label: "Attachments" },
  { id: "private-recordings", label: "Private recordings" }
];

/**
 * Future-ready architecture hooks — not implemented.
 */
export const MEETING_NOTES_FUTURE_ARCHITECTURE = {
  aiSummaries: "Draft steward-reviewed summaries from meeting narratives.",
  voiceTranscription: "Transcribe private consultation recordings with consent.",
  attachments: "Attach documents to meeting notes — consultant-admin only.",
  privateRecordings: "Store encrypted recordings linked to permanent note IDs."
} as const;

export function formatMeetingNoteId(year: number, sequence: number): string {
  return `${MEETING_NOTE_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidMeetingNoteId(value: string): boolean {
  return MEETING_NOTE_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeMeetingNoteId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseMeetingNoteId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-MN-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function meetingNoteIdYearFromDate(
  isoDate: string,
  fallbackYear = new Date().getFullYear()
): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
