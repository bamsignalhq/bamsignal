import { STORAGE_KEYS } from "../constants/limits";
import { normalizeMeetingLinkChannel } from "../constants/meetingLink";
import type { CalendarParticipant } from "../types/calendar";
import type {
  MeetingLinkAccess,
  MeetingLinkChannel,
  MeetingLinkRecord
} from "../types/meetingLink";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import { buildCalendarParticipants } from "./calendarLogic";
import {
  appendMeetingLinkTimelineEntry,
  buildMeetingLinkTimeline,
  markParticipantsNotified
} from "./meetingLinkLogic";
import { readJson, writeJson } from "./storage";

type MeetingLinkStore = {
  records: Record<string, MeetingLinkRecord>;
  byMeetingId: Record<string, string>;
  byMemberId: Record<string, string>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeMeetingLinkStore;

function loadStore(): MeetingLinkStore {
  return readJson<MeetingLinkStore>(STORE_KEY, {
    records: {},
    byMeetingId: {},
    byMemberId: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: MeetingLinkStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function normalizeMeetingRecord(record: MeetingLinkRecord): MeetingLinkRecord {
  return {
    ...record,
    status: record.status ?? "ready",
    participants: record.participants ?? []
  };
}

export function getMeetingLinkForMeeting(meetingId: string): MeetingLinkRecord | null {
  const store = loadStore();
  const recordId = store.byMeetingId[meetingId];
  const record = recordId ? store.records[recordId] ?? null : null;
  return record ? normalizeMeetingRecord(record) : null;
}

export function getMeetingLinkForMember(memberId: string): MeetingLinkRecord | null {
  const store = loadStore();
  const recordId = store.byMemberId[memberId];
  const record = recordId ? store.records[recordId] ?? null : null;
  return record ? normalizeMeetingRecord(record) : null;
}

export function listMeetingLinks(): MeetingLinkRecord[] {
  const store = loadStore();
  return Object.values(store.records).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function recordMeetingLink(input: {
  meetingId: string;
  consultationEventId?: string;
  googleEventId?: string;
  journeyId?: string;
  member: ConciergeMemberRecord;
  consultant: ConciergeConsultantRecord;
  memberEmail: string;
  channel: MeetingLinkChannel;
  provider: MeetingLinkRecord["provider"];
  access: MeetingLinkAccess;
  participants?: CalendarParticipant[];
  calendarEventLinkedAt?: string;
  scheduledAt?: string;
}): MeetingLinkRecord {
  const store = loadStore();
  const now = new Date().toISOString();
  const recordId = `meet_link_${Date.now().toString(36)}`;
  const participants = markParticipantsNotified(
    input.participants ??
      buildCalendarParticipants({
        member: input.member,
        memberEmail: input.memberEmail,
        consultant: input.consultant,
        invitedAt: now
      }),
    now
  );

  const timeline = buildMeetingLinkTimeline({
    meetingCreatedAt: now,
    calendarEventLinkedAt: input.calendarEventLinkedAt ?? (input.consultationEventId ? now : undefined),
    linkGeneratedAt: now,
    linkStoredAt: now
  });

  const record: MeetingLinkRecord = {
    id: recordId,
    meetingId: input.meetingId,
    consultationEventId: input.consultationEventId,
    googleEventId: input.googleEventId,
    journeyId: input.journeyId,
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    consultantId: input.consultant.id,
    consultantName: input.consultant.name,
    channel: input.channel,
    provider: input.provider,
    access: input.access,
    participants,
    timeline,
    status: "ready",
    scheduledAt: input.scheduledAt,
    createdAt: now,
    updatedAt: now
  };

  saveStore({
    ...store,
    records: { ...store.records, [recordId]: record },
    byMeetingId: { ...store.byMeetingId, [input.meetingId]: recordId },
    byMemberId: { ...store.byMemberId, [input.member.id]: recordId }
  });

  return record;
}

export function attachMeetingLinkToConsultationEvent(input: {
  meetingId: string;
  consultationEventId: string;
  googleEventId?: string;
}): MeetingLinkRecord | null {
  const store = loadStore();
  const record = getMeetingLinkForMeeting(input.meetingId);
  if (!record) return null;

  const now = new Date().toISOString();
  const next: MeetingLinkRecord = {
    ...record,
    consultationEventId: input.consultationEventId,
    googleEventId: input.googleEventId ?? record.googleEventId,
    timeline: appendMeetingLinkTimelineEntry(
      record.timeline,
      {
        id: `meet_tl_calendar-event-linked_${Date.parse(now)}`,
        kind: "calendar-event-linked",
        label: "Calendar Event Linked",
        detail: "Consultation calendar event connected.",
        at: now
      }
    ),
    updatedAt: now
  };

  saveStore({
    ...store,
    records: { ...store.records, [record.id]: next }
  });
  return next;
}

export function normalizeChannelForMeetingLink(channel: string): MeetingLinkChannel | null {
  return normalizeMeetingLinkChannel(channel);
}

export function resetMeetingLinkStoreForTests(): void {
  writeJson(STORE_KEY, {
    records: {},
    byMeetingId: {},
    byMemberId: {},
    updatedAt: new Date().toISOString()
  });
}
