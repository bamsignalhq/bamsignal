export type MeetingNoteVisibility = "consultant-admin";

export type MeetingNoteType =
  | "consultation"
  | "application-review"
  | "follow-up"
  | "introduction-review"
  | "relationship-support"
  | "marriage-celebration"
  | "legacy-archive";

export type MeetingObservation = {
  id: string;
  label: string;
  detail: string;
  recordedAt: string;
};

export type MeetingRecommendation = {
  id: string;
  label: string;
  detail: string;
  priority: "standard" | "elevated";
  recordedAt: string;
};

export type MeetingActionItem = {
  id: string;
  title: string;
  dueAt?: string;
  completed: boolean;
  recordedAt: string;
};

export type MeetingNote = {
  id: string;
  noteId: string;
  memberId: string;
  journeyId?: string;
  memberName: string;
  consultantId: string;
  consultantName: string;
  type: MeetingNoteType;
  visibility: MeetingNoteVisibility;
  title: string;
  narrative: string;
  heldAt: string;
  durationMinutes?: number;
  platform?: string;
  observations: MeetingObservation[];
  recommendations: MeetingRecommendation[];
  actionItems: MeetingActionItem[];
  recordedAt: string;
  recordedBy: string;
};

export type MeetingSummary = {
  memberId: string;
  journeyId?: string;
  memberName: string;
  totalNotes: number;
  totalRecommendations: number;
  openActionItems: number;
  latestNoteAt?: string;
  narrative: string;
};

export type MeetingTimelineEntry = {
  id: string;
  noteId: string;
  type: MeetingNoteType;
  title: string;
  heldAt: string;
  consultantName: string;
  preview: string;
};

/** Reserved — not implemented. */
export type MeetingNotesFutureCapability =
  | "ai-summaries"
  | "voice-transcription"
  | "attachments"
  | "private-recordings";

export type MeetingNotesFutureConfig = {
  capability?: MeetingNotesFutureCapability;
  enabled?: boolean;
};

export type MemberMeetingNotesBundle = {
  summary: MeetingSummary;
  notes: MeetingNote[];
  recommendations: MeetingRecommendation[];
  actionItems: MeetingActionItem[];
  timeline: MeetingTimelineEntry[];
};
