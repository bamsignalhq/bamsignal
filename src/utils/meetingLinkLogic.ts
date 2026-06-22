import { MEETING_LINK_TIMELINE_STEPS } from "../constants/meetingLink";
import type {
  MeetingLinkAccess,
  MeetingLinkChannel,
  MeetingLinkRecord,
  MeetingLinkTimelineEntry,
  MeetingLinkTimelineKind
} from "../types/meetingLink";
import type { CalendarParticipant } from "../types/calendar";

function timelineEntryId(kind: MeetingLinkTimelineKind, at: string): string {
  return `meet_tl_${kind}_${Date.parse(at)}`;
}

export function createMeetingLinkTimelineEntry(input: {
  kind: MeetingLinkTimelineKind;
  label: string;
  detail?: string;
  at: string;
}): MeetingLinkTimelineEntry {
  return {
    id: timelineEntryId(input.kind, input.at),
    kind: input.kind,
    label: input.label,
    detail: input.detail,
    at: input.at
  };
}

/** Append-only — never removes or reorders existing entries. */
export function appendMeetingLinkTimelineEntry(
  timeline: MeetingLinkTimelineEntry[],
  entry: MeetingLinkTimelineEntry
): MeetingLinkTimelineEntry[] {
  if (timeline.some((item) => item.kind === entry.kind)) return timeline;
  return [...timeline, entry];
}

export function buildMeetingLinkTimeline(
  timestamps: {
    calendarEventLinkedAt?: string;
    linkGeneratedAt?: string;
    linkStoredAt?: string;
    consultantNotifiedAt?: string;
    memberNotifiedAt?: string;
  } = {}
): MeetingLinkTimelineEntry[] {
  const mapping: Partial<Record<MeetingLinkTimelineKind, string | undefined>> = {
    "calendar-event-linked": timestamps.calendarEventLinkedAt,
    "link-generated": timestamps.linkGeneratedAt,
    "link-stored": timestamps.linkStoredAt,
    "consultant-notified": timestamps.consultantNotifiedAt,
    "member-notified": timestamps.memberNotifiedAt
  };

  let timeline: MeetingLinkTimelineEntry[] = [];
  for (const step of MEETING_LINK_TIMELINE_STEPS) {
    const at = mapping[step.kind];
    if (!at) continue;
    timeline = appendMeetingLinkTimelineEntry(
      timeline,
      createMeetingLinkTimelineEntry({
        kind: step.kind,
        label: step.label,
        detail: step.detail,
        at
      })
    );
  }
  return timeline;
}

export function buildPhoneMeetingAccess(input: {
  consultantName: string;
  consultantPhone?: string;
}): MeetingLinkAccess {
  return {
    phoneNumber: input.consultantPhone,
    dialInInstructions: input.consultantPhone
      ? `${input.consultantName} will call you at ${input.consultantPhone} at the scheduled time.`
      : `${input.consultantName} will call you privately at the scheduled time.`
  };
}

export function summarizeMeetingLink(record: MeetingLinkRecord): string {
  if (record.channel === "phone") {
    return `${record.meetingId} · Phone consultation · ${record.memberName}`;
  }
  return `${record.meetingId} · ${record.channel} · ${record.access.joinUrl || "link pending"}`;
}

export function meetingAccessLabel(channel: MeetingLinkChannel, access: MeetingLinkAccess): string {
  if (channel === "phone") return access.dialInInstructions || "Phone consultation";
  return access.joinUrl || "Meeting link pending";
}

export function markParticipantsNotified(
  participants: CalendarParticipant[],
  at: string
): CalendarParticipant[] {
  return participants.map((participant) => ({
    ...participant,
    invitedAt: participant.invitedAt ?? at,
    inviteStatus: "sent"
  }));
}
