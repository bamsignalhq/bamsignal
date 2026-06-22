import {
  MEETING_NOTE_PRIVACY_COPY,
  MEETING_NOTE_TYPE_LABELS,
  MEETING_NOTE_VISIBILITY,
  MEETING_NOTES_APPEND_ONLY_RULE
} from "../constants/meetingNotes";
import type { ConciergeCommunicationJournalEntry, ConciergeMemberRecord } from "../types/conciergeConsultant";
import type {
  MeetingActionItem,
  MeetingNote,
  MeetingNoteType,
  MeetingObservation,
  MeetingRecommendation,
  MeetingSummary,
  MeetingTimelineEntry,
  MemberMeetingNotesBundle
} from "../types/meetingNotes";

function inferMeetingType(entry: ConciergeCommunicationJournalEntry, member: ConciergeMemberRecord): MeetingNoteType {
  const summary = entry.summary.toLowerCase();
  if (summary.includes("archive")) return "legacy-archive";
  if (summary.includes("introduction") || summary.includes("intro")) return "introduction-review";
  if (summary.includes("follow-up") || summary.includes("check-in")) return "follow-up";
  if (summary.includes("consultation") || summary.includes("initial")) return "consultation";
  if (member.status === "married") return "marriage-celebration";
  if (member.status === "legacy-archive") return "legacy-archive";
  if (member.status === "under-review" || member.status === "applied") return "application-review";
  if (
    member.status === "relationship" ||
    member.status === "matched" ||
    member.status === "exclusive" ||
    member.status === "engaged"
  ) {
    return "relationship-support";
  }
  return "consultation";
}

function buildObservations(entry: ConciergeCommunicationJournalEntry): MeetingObservation[] {
  const observations: MeetingObservation[] = [];
  if (entry.summary) {
    observations.push({
      id: `obs_summary_${entry.id}`,
      label: "Meeting summary",
      detail: entry.summary,
      recordedAt: entry.loggedAt
    });
  }
  if (entry.outcome) {
    observations.push({
      id: `obs_outcome_${entry.id}`,
      label: "Outcome",
      detail: entry.outcome,
      recordedAt: entry.loggedAt
    });
  }
  return observations;
}

function buildRecommendations(entry: ConciergeCommunicationJournalEntry): MeetingRecommendation[] {
  const recommendations: MeetingRecommendation[] = [];
  if (entry.nextAction) {
    recommendations.push({
      id: `rec_next_${entry.id}`,
      label: "Steward recommendation",
      detail: entry.nextAction,
      priority: "standard",
      recordedAt: entry.loggedAt
    });
  }
  return recommendations;
}

function buildActionItems(entry: ConciergeCommunicationJournalEntry): MeetingActionItem[] {
  if (!entry.nextAction) return [];
  return [
    {
      id: `act_${entry.id}`,
      title: entry.nextAction,
      completed: false,
      recordedAt: entry.loggedAt
    }
  ];
}

export function buildMeetingNoteFromJournalEntry(input: {
  entry: ConciergeCommunicationJournalEntry;
  member: ConciergeMemberRecord;
  noteId: string;
}): MeetingNote {
  const { entry, member, noteId } = input;
  const type = inferMeetingType(entry, member);

  return {
    id: `meeting_note_${entry.id}`,
    noteId,
    memberId: member.id,
    journeyId: member.journeyId,
    memberName: member.aboutYou.name,
    consultantId: entry.consultantId,
    consultantName: entry.consultantName,
    type,
    visibility: MEETING_NOTE_VISIBILITY,
    title: `${MEETING_NOTE_TYPE_LABELS[type]} — ${member.aboutYou.name}`,
    narrative: entry.summary,
    heldAt: entry.date,
    durationMinutes: entry.durationMinutes,
    platform: entry.platform,
    observations: buildObservations(entry),
    recommendations: buildRecommendations(entry),
    actionItems: buildActionItems(entry),
    recordedAt: entry.loggedAt,
    recordedBy: entry.loggedBy
  };
}

export function buildMeetingNoteFromPrivateNote(input: {
  note: ConciergeMemberRecord["privateNotes"][number];
  member: ConciergeMemberRecord;
  noteId: string;
}): MeetingNote {
  const { note, member, noteId } = input;
  const type: MeetingNoteType =
    member.status === "legacy-archive"
      ? "legacy-archive"
      : member.status === "married"
        ? "marriage-celebration"
        : "application-review";

  return {
    id: `meeting_note_private_${note.id}`,
    noteId,
    memberId: member.id,
    journeyId: member.journeyId,
    memberName: member.aboutYou.name,
    consultantId: note.consultantId,
    consultantName: "Steward",
    type,
    visibility: MEETING_NOTE_VISIBILITY,
    title: `${MEETING_NOTE_TYPE_LABELS[type]} — steward note`,
    narrative: note.body,
    heldAt: note.createdAt,
    observations: [
      {
        id: `obs_private_${note.id}`,
        label: "Steward observation",
        detail: note.body,
        recordedAt: note.createdAt
      }
    ],
    recommendations: [],
    actionItems: [],
    recordedAt: note.createdAt,
    recordedBy: "Steward"
  };
}

export function deriveMeetingNotesFromMember(
  member: ConciergeMemberRecord,
  assignNoteId: (recordId: string, at: string) => string,
  existingNotes: Record<string, MeetingNote> = {}
): MeetingNote[] {
  const notes: MeetingNote[] = [];

  for (const entry of member.communicationJournal) {
    const recordId = `meeting_note_${entry.id}`;
    const noteId = existingNotes[recordId]?.noteId ?? assignNoteId(recordId, entry.loggedAt);
    const existing = existingNotes[recordId];
    const draft = buildMeetingNoteFromJournalEntry({ entry, member, noteId });
    notes.push(existing ? mergeMeetingNote(existing, draft) : draft);
  }

  for (const privateNote of member.privateNotes) {
    const recordId = `meeting_note_private_${privateNote.id}`;
    const noteId = existingNotes[recordId]?.noteId ?? assignNoteId(recordId, privateNote.createdAt);
    const existing = existingNotes[recordId];
    const draft = buildMeetingNoteFromPrivateNote({ note: privateNote, member, noteId });
    notes.push(existing ? mergeMeetingNote(existing, draft) : draft);
  }

  if (member.status === "married" && !notes.some((note) => note.type === "marriage-celebration")) {
    const at = member.updatedAt;
    const recordId = `meeting_note_milestone_${member.id}`;
    notes.push({
      id: recordId,
      noteId: existingNotes[recordId]?.noteId ?? assignNoteId(recordId, at),
      memberId: member.id,
      journeyId: member.journeyId,
      memberName: member.aboutYou.name,
      consultantId: member.currentConsultantId ?? member.assignedConsultantId ?? "steward",
      consultantName: member.assignedConsultantName ?? "Steward",
      type: "marriage-celebration",
      visibility: MEETING_NOTE_VISIBILITY,
      title: `Marriage Celebration — ${member.aboutYou.name}`,
      narrative: "Journey milestone recorded — marriage celebration noted in permanent meeting memory.",
      heldAt: at,
      observations: [
        {
          id: `obs_marriage_${member.id}`,
          label: "Milestone",
          detail: "Marriage milestone celebrated privately within BamSignal stewardship.",
          recordedAt: at
        }
      ],
      recommendations: [],
      actionItems: [],
      recordedAt: at,
      recordedBy: "BamSignal Admin"
    });
  }

  return notes.sort((a, b) => Date.parse(b.heldAt) - Date.parse(a.heldAt));
}

/** Append-only merge — never removes observations, recommendations, or action items. */
export function mergeMeetingNote(existing: MeetingNote, incoming: MeetingNote): MeetingNote {
  const observationIds = new Set(existing.observations.map((item) => item.id));
  const recommendationIds = new Set(existing.recommendations.map((item) => item.id));
  const actionIds = new Set(existing.actionItems.map((item) => item.id));

  return {
    ...existing,
    memberName: incoming.memberName,
    journeyId: incoming.journeyId ?? existing.journeyId,
    title: existing.title || incoming.title,
    narrative: existing.narrative || incoming.narrative,
    observations: [
      ...existing.observations,
      ...incoming.observations.filter((item) => !observationIds.has(item.id))
    ],
    recommendations: [
      ...existing.recommendations,
      ...incoming.recommendations.filter((item) => !recommendationIds.has(item.id))
    ],
    actionItems: [
      ...existing.actionItems,
      ...incoming.actionItems.filter((item) => !actionIds.has(item.id))
    ]
  };
}

export function buildMeetingTimeline(notes: MeetingNote[]): MeetingTimelineEntry[] {
  return notes.map((note) => ({
    id: `timeline_${note.id}`,
    noteId: note.noteId,
    type: note.type,
    title: note.title,
    heldAt: note.heldAt,
    consultantName: note.consultantName,
    preview: note.narrative
  }));
}

export function buildMeetingSummary(member: ConciergeMemberRecord, notes: MeetingNote[]): MeetingSummary {
  const recommendations = notes.flatMap((note) => note.recommendations);
  const actionItems = notes.flatMap((note) => note.actionItems);
  const openActionItems = actionItems.filter((item) => !item.completed).length;
  const latestNoteAt = notes[0]?.heldAt;

  return {
    memberId: member.id,
    journeyId: member.journeyId,
    memberName: member.aboutYou.name,
    totalNotes: notes.length,
    totalRecommendations: recommendations.length,
    openActionItems,
    latestNoteAt,
    narrative: `${MEETING_NOTE_PRIVACY_COPY} ${notes.length} meeting note${
      notes.length === 1 ? "" : "s"
    } on record. ${MEETING_NOTES_APPEND_ONLY_RULE}`
  };
}

export function buildMemberMeetingNotesBundle(
  member: ConciergeMemberRecord,
  notes: MeetingNote[]
): MemberMeetingNotesBundle {
  const recommendations = notes.flatMap((note) => note.recommendations);
  const actionItems = notes.flatMap((note) => note.actionItems);

  return {
    summary: buildMeetingSummary(member, notes),
    notes,
    recommendations,
    actionItems,
    timeline: buildMeetingTimeline(notes)
  };
}
