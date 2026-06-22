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
    consultationConfirmedAt?: string;
    consultantInvitedAt?: string;
    memberInvitedAt?: string;
    consultationCompletedAt?: string;
    consultationRescheduledAt?: string;
    consultationCancelledAt?: string;
  } = {}
): CalendarTimelineEntry[] {
  const mapping: Partial<Record<CalendarTimelineKind, string | undefined>> = {
    "availability-loaded": timestamps.availabilityLoadedAt,
    "slot-selected": timestamps.slotSelectedAt,
    "event-created": timestamps.eventCreatedAt,
    "consultation-confirmed":
      timestamps.consultationConfirmedAt ?? timestamps.consultantInvitedAt ?? timestamps.memberInvitedAt,
    "consultant-invited": timestamps.consultantInvitedAt,
    "member-invited": timestamps.memberInvitedAt,
    "consultation-completed": timestamps.consultationCompletedAt,
    "consultation-rescheduled": timestamps.consultationRescheduledAt,
    "consultation-cancelled": timestamps.consultationCancelledAt
  };

  let timeline: CalendarTimelineEntry[] = [];
  for (const step of CALENDAR_TIMELINE_STEPS) {
    const at = mapping[step.kind];
    if (!at) continue;
    if (step.kind === "consultant-invited" || step.kind === "member-invited") {
      if (mapping["consultation-confirmed"]) continue;
    }
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
  availableDays?: number[];
  availableHours?: number[];
  blackoutPeriods?: { startsAt: string; endsAt: string; reason?: string }[];
  durationMinutes?: number;
  horizonDays?: number;
  now?: Date;
}): CalendarAvailability {
  const now = input.now ?? new Date();
  const booked = input.bookedStartsAt ?? new Set<string>();
  const days = input.availableDays?.length ? input.availableDays : [1, 2, 3, 4, 5];
  const hours = input.availableHours?.length ? input.availableHours : [10, 14, 16];
  const durationMinutes = input.durationMinutes ?? CALENDAR_DEFAULT_DURATION_MINUTES;
  const horizonDays = input.horizonDays ?? 7;
  const blackoutPeriods = input.blackoutPeriods ?? [];
  const slots: CalendarSlot[] = [];

  for (let day = 0; day < horizonDays; day += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    if (!days.includes(date.getDay())) continue;

    for (const hour of hours) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      const startsAt = slotDate.toISOString();
      const endsAt = new Date(slotDate.getTime() + durationMinutes * 60_000).toISOString();
      if (new Date(startsAt).getTime() < now.getTime()) continue;
      const blackedOut = blackoutPeriods.some((period) => {
        const from = Date.parse(period.startsAt);
        const to = Date.parse(period.endsAt);
        const startMs = Date.parse(startsAt);
        return !Number.isNaN(from) && !Number.isNaN(to) && startMs >= from && startMs < to;
      });
      if (blackedOut) continue;

      slots.push({
        id: `cal_slot_${input.consultantId}_${day}_${hour}`,
        consultantId: input.consultantId,
        startsAt,
        endsAt,
        durationMinutes,
        available: !booked.has(startsAt)
      });
    }
  }

  return {
    consultantId: input.consultantId,
    consultantName: input.consultantName,
    timezone: input.timezone,
    availableDays: days,
    availableHours: hours,
    blackoutPeriods,
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
