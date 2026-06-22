import {
  CALENDAR_DEFAULT_DURATION_MINUTES,
  CALENDAR_TIMELINE_STEPS
} from "../constants/calendar";
import type {
  CalendarAvailability,
  CalendarParticipant,
  CalendarSlot,
  CalendarTimelineEntry,
  CalendarTimelineKind,
  ConsultationEvent
} from "../types/calendar";
import type { ConsultationChannel } from "../types/consultationScheduler";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";

function timelineEntryId(kind: CalendarTimelineKind, at: string): string {
  return `cal_tl_${kind}_${Date.parse(at)}`;
}

export function createCalendarTimelineEntry(input: {
  kind: CalendarTimelineKind;
  label: string;
  detail?: string;
  at: string;
}): CalendarTimelineEntry {
  return {
    id: timelineEntryId(input.kind, input.at),
    kind: input.kind,
    label: input.label,
    detail: input.detail,
    at: input.at
  };
}

/** Append-only — never removes or reorders existing entries. */
export function appendCalendarTimelineEntry(
  timeline: CalendarTimelineEntry[],
  entry: CalendarTimelineEntry
): CalendarTimelineEntry[] {
  if (timeline.some((item) => item.kind === entry.kind)) return timeline;
  return [...timeline, entry];
}

export function appendCalendarTimelineEntries(
  timeline: CalendarTimelineEntry[],
  entries: CalendarTimelineEntry[]
): CalendarTimelineEntry[] {
  return entries.reduce((current, entry) => appendCalendarTimelineEntry(current, entry), timeline);
}

export function buildStandardCalendarTimeline(
  timestamps: {
    availabilityLoadedAt?: string;
    slotSelectedAt?: string;
    eventCreatedAt?: string;
    consultantInvitedAt?: string;
    memberInvitedAt?: string;
  } = {}
): CalendarTimelineEntry[] {
  const mapping: Partial<Record<CalendarTimelineKind, string | undefined>> = {
    "availability-loaded": timestamps.availabilityLoadedAt,
    "slot-selected": timestamps.slotSelectedAt,
    "event-created": timestamps.eventCreatedAt,
    "consultant-invited": timestamps.consultantInvitedAt,
    "member-invited": timestamps.memberInvitedAt
  };

  let timeline: CalendarTimelineEntry[] = [];
  for (const step of CALENDAR_TIMELINE_STEPS) {
    const at = mapping[step.kind];
    if (!at) continue;
    timeline = appendCalendarTimelineEntry(
      timeline,
      createCalendarTimelineEntry({
        kind: step.kind,
        label: step.label,
        detail: step.detail,
        at
      })
    );
  }
  return timeline;
}

export function buildCalendarParticipants(input: {
  member: Pick<ConciergeMemberRecord, "id" | "aboutYou">;
  memberEmail: string;
  consultant: Pick<ConciergeConsultantRecord, "id" | "name" | "email">;
  invitedAt?: string;
}): CalendarParticipant[] {
  const at = input.invitedAt ?? new Date().toISOString();
  return [
    {
      id: `cal_part_member_${input.member.id}`,
      role: "member",
      name: input.member.aboutYou.name,
      email: input.memberEmail,
      memberId: input.member.id,
      invitedAt: at,
      inviteStatus: "sent"
    },
    {
      id: `cal_part_consultant_${input.consultant.id}`,
      role: "consultant",
      name: input.consultant.name,
      email: input.consultant.email,
      consultantId: input.consultant.id,
      invitedAt: at,
      inviteStatus: "sent"
    }
  ];
}

export function buildDefaultAvailabilitySlots(input: {
  consultantId: string;
  consultantName: string;
  timezone: string;
  bookedStartsAt?: Set<string>;
  now?: Date;
}): CalendarAvailability {
  const now = input.now ?? new Date();
  const booked = input.bookedStartsAt ?? new Set<string>();
  const slots: CalendarSlot[] = [];

  for (let day = 0; day < 7; day += 1) {
    for (const hour of [10, 14, 16]) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      date.setHours(hour, 0, 0, 0);
      const startsAt = date.toISOString();
      const endsAt = new Date(date.getTime() + CALENDAR_DEFAULT_DURATION_MINUTES * 60_000).toISOString();
      if (new Date(startsAt).getTime() < now.getTime()) continue;
      slots.push({
        id: `cal_slot_${input.consultantId}_${day}_${hour}`,
        consultantId: input.consultantId,
        startsAt,
        endsAt,
        durationMinutes: CALENDAR_DEFAULT_DURATION_MINUTES,
        available: !booked.has(startsAt)
      });
    }
  }

  return {
    consultantId: input.consultantId,
    consultantName: input.consultantName,
    timezone: input.timezone,
    slots,
    updatedAt: new Date().toISOString()
  };
}

export function mapPreferenceToCalendarChannel(
  preference?: string
): ConsultationChannel {
  if (preference === "whatsapp") return "whatsapp-voice";
  if (preference === "phone") return "phone";
  if (preference === "google-meet") return "google-meet";
  return "zoom";
}

export function summarizeConsultationEvent(event: ConsultationEvent): string {
  return `${event.meetingId} · ${event.memberName} · ${new Date(event.scheduledAt).toLocaleString()}`;
}
