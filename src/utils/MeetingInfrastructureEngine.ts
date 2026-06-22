import { MEETING_INFRASTRUCTURE_TIMELINE_STEPS } from "../constants/meetingInfrastructure";
import type { MeetingInfrastructureStatus } from "../types/meetingLink";
import type { MeetingLinkRecord, MeetingLinkTimelineEntry, MeetingLinkTimelineKind } from "../types/meetingLink";
import type { ConsultationEvent } from "../types/calendar";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import {
  getMeetingLinkForMember,
  getMeetingLinkForMeeting,
  listMeetingLinks,
  recordMeetingLink
} from "./MeetingLinkEngine";
import { appendMeetingLinkTimelineEntry, createMeetingLinkTimelineEntry } from "./meetingLinkLogic";
import { readJson, writeJson } from "./storage";
import { STORAGE_KEYS } from "../constants/limits";

export {
  getMeetingLinkForMember as getMeetingInfrastructureForMember,
  getMeetingLinkForMeeting as getMeetingInfrastructureForMeeting,
  listMeetingLinks as listMeetingInfrastructureRecords
} from "./MeetingLinkEngine";

export function recordMeetingInfrastructure(
  input: Parameters<typeof recordMeetingLink>[0]
): MeetingLinkRecord {
  return recordMeetingLink(input);
}

export function listMeetingsByStatus(
  status: MeetingInfrastructureStatus | MeetingInfrastructureStatus[]
): MeetingLinkRecord[] {
  const statuses = new Set(Array.isArray(status) ? status : [status]);
  return listMeetingLinks().filter((record) => statuses.has(record.status));
}

function timelineForStatus(status: MeetingInfrastructureStatus, at: string): MeetingLinkTimelineEntry | null {
  const step = MEETING_INFRASTRUCTURE_TIMELINE_STEPS.find((item) => {
    if (status === "in-progress") return item.kind === "meeting-started";
    if (status === "completed") return item.kind === "meeting-completed";
    if (status === "cancelled") return item.kind === "meeting-cancelled";
    return false;
  });
  if (!step) return null;
  return createMeetingLinkTimelineEntry({
    kind: step.kind as MeetingLinkTimelineKind,
    label: step.label,
    detail: step.detail,
    at
  });
}

export function markMeetingInvitesSent(meetingId: string, at = new Date().toISOString()): MeetingLinkRecord | null {
  const record = getMeetingLinkForMeeting(meetingId);
  if (!record) return null;

  const entry = createMeetingLinkTimelineEntry({
    kind: "meeting-invite-sent",
    label: "Meeting Invite Sent",
    detail: "Access details sent via Email Engine™ and WhatsApp Engine™.",
    at
  });

  const next: MeetingLinkRecord = {
    ...record,
    timeline: appendMeetingLinkTimelineEntry(record.timeline, entry),
    updatedAt: at
  };

  const store = readJson<{
    records: Record<string, MeetingLinkRecord>;
    byMeetingId: Record<string, string>;
    byMemberId: Record<string, string>;
    updatedAt: string;
  }>(STORAGE_KEYS.conciergeMeetingLinkStore, {
    records: {},
    byMeetingId: {},
    byMemberId: {},
    updatedAt: at
  });

  writeJson(STORAGE_KEYS.conciergeMeetingLinkStore, {
    ...store,
    records: { ...store.records, [record.id]: next },
    updatedAt: at
  });
  return next;
}

export function updateMeetingInfrastructureStatus(
  meetingId: string,
  status: MeetingInfrastructureStatus
): MeetingLinkRecord | null {
  const record = getMeetingLinkForMeeting(meetingId);
  if (!record) return null;

  const at = new Date().toISOString();
  const entry = timelineForStatus(status, at);
  const next: MeetingLinkRecord = {
    ...record,
    status,
    timeline: entry ? appendMeetingLinkTimelineEntry(record.timeline, entry) : record.timeline,
    updatedAt: at
  };

  const store = readJson<{
    records: Record<string, MeetingLinkRecord>;
    byMeetingId: Record<string, string>;
    byMemberId: Record<string, string>;
    updatedAt: string;
  }>(STORAGE_KEYS.conciergeMeetingLinkStore, {
    records: {},
    byMeetingId: {},
    byMemberId: {},
    updatedAt: at
  });

  writeJson(STORAGE_KEYS.conciergeMeetingLinkStore, {
    ...store,
    records: { ...store.records, [record.id]: next },
    updatedAt: at
  });
  return next;
}

export function attachMeetingInfrastructureToConsultation(input: {
  application: SignalConciergeApplication;
  event: ConsultationEvent;
  member: ConciergeMemberRecord;
  consultant: ConciergeConsultantRecord;
  memberEmail: string;
  record: MeetingLinkRecord;
}): MeetingLinkRecord {
  return input.record;
}
