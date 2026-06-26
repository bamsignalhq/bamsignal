import {
  CALENDAR_DEFAULT_TIMEZONE
} from "../constants/calendar";
import { getConsultantAvailabilityConfig } from "./consultationSchedulingAvailabilityStore";
import { STORAGE_KEYS } from "../constants/limits";
import type {
  CalendarAvailability,
  CalendarSlot,
  CalendarTimelineEntry,
  ConsultationEvent
} from "../types/calendar";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { ConciergeConsultantRecord } from "../types/conciergeConsultantDirectory";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import { listConciergeConsultants } from "./conciergeConsultantDirectoryStore";
import { ensureMemberJourneyId } from "./conciergeJourneyRegistry";
import { ensureConsultationMeetingId } from "./consultationMeetingIdRegistry";
import {
  listConsultationMeetings,
  scheduleConsultationMeeting,
  syncConsultationMeetingsFromSources
} from "./consultationScheduler";
import {
  appendCalendarTimelineEntries,
  buildCalendarParticipants,
  buildDefaultAvailabilitySlots,
  buildStandardCalendarTimeline,
  createCalendarTimelineEntry,
  mapPreferenceToCalendarChannel
} from "./calendarLogic";
import { readJson, writeJson } from "./storage";

type CalendarStore = {
  events: Record<string, ConsultationEvent>;
  availability: Record<string, CalendarAvailability>;
  updatedAt: string;
};

const STORE_KEY = STORAGE_KEYS.conciergeCalendarStore;

function loadStore(): CalendarStore {
  return readJson<CalendarStore>(STORE_KEY, {
    events: {},
    availability: {},
    updatedAt: new Date().toISOString()
  });
}

function saveStore(store: CalendarStore): void {
  writeJson(STORE_KEY, { ...store, updatedAt: new Date().toISOString() });
}

function bookedStartsForConsultant(consultantId: string): Set<string> {
  const booked = new Set<string>();
  for (const meeting of listConsultationMeetings()) {
    if (meeting.consultantId === consultantId) booked.add(meeting.scheduledAt);
  }
  for (const event of Object.values(loadStore().events)) {
    if (event.consultantId === consultantId && event.status !== "cancelled") {
      booked.add(event.scheduledAt);
    }
  }
  return booked;
}

export function syncCalendarAvailabilityFromConsultants(): CalendarAvailability[] {
  syncConsultationMeetingsFromSources();
  const consultants = listConciergeConsultants().filter((item) => item.status === "active");
  const availability: Record<string, CalendarAvailability> = {};

  for (const consultant of consultants) {
    const config = getConsultantAvailabilityConfig(consultant.id);
    availability[consultant.id] = buildDefaultAvailabilitySlots({
      consultantId: consultant.id,
      consultantName: consultant.name,
      timezone: config.timezone,
      bookedStartsAt: bookedStartsForConsultant(consultant.id),
      availableDays: config.availableDays,
      availableHours: config.availableHours,
      blackoutPeriods: config.blackoutPeriods,
      durationMinutes: config.durationMinutes,
      horizonDays: config.horizonDays
    });
  }

  const store = loadStore();
  saveStore({ ...store, availability });
  return Object.values(availability);
}

export function listCalendarAvailability(consultantId?: string): CalendarAvailability[] {
  const store = loadStore();
  const all = Object.keys(store.availability).length
    ? Object.values(store.availability)
    : syncCalendarAvailabilityFromConsultants();
  if (!consultantId) return all;
  return all.filter((item) => item.consultantId === consultantId);
}

export function listAvailableCalendarSlots(consultantId: string): CalendarSlot[] {
  const availability = listCalendarAvailability(consultantId)[0];
  return (availability?.slots ?? []).filter((slot) => slot.available);
}

export function listConsultationEvents(): ConsultationEvent[] {
  return Object.values(loadStore().events).sort(
    (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
  );
}

export function getConsultationEvent(id: string): ConsultationEvent | null {
  const store = loadStore();
  return (
    store.events[id] ??
    Object.values(store.events).find(
      (event) => event.meetingId === id || event.memberId === id || event.googleEventId === id
    ) ??
    null
  );
}

export function getUpcomingConsultationEventForMember(memberId: string): ConsultationEvent | null {
  const now = Date.now();
  return (
    listConsultationEvents()
      .filter(
        (event) =>
          event.memberId === memberId &&
          event.status !== "cancelled" &&
          new Date(event.scheduledAt).getTime() >= now
      )
      .sort((a, b) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt))[0] ?? null
  );
}

function resolveConsultant(consultantId?: string): ConciergeConsultantRecord | null {
  const consultants = listConciergeConsultants().filter((item) => item.status === "active");
  if (!consultantId) return consultants[0] ?? null;
  return consultants.find((item) => item.id === consultantId) ?? null;
}

export function recordConsultationEvent(input: {
  member: ConciergeMemberRecord;
  consultant: ConciergeConsultantRecord;
  memberEmail: string;
  slot: CalendarSlot;
  channel: ConsultationEvent["channel"];
  googleEventId?: string;
  googleEventLink?: string;
  meetingId?: string;
}): ConsultationEvent {
  const store = loadStore();
  const now = new Date().toISOString();
  const recordId = `cal_event_${Date.now().toString(36)}`;
  const meetingId = input.meetingId ?? ensureConsultationMeetingId(recordId, now);
  const participants = buildCalendarParticipants({
    member: input.member,
    memberEmail: input.memberEmail,
    consultant: input.consultant,
    invitedAt: now
  });

  const timeline = buildStandardCalendarTimeline({
    availabilityLoadedAt: now,
    slotSelectedAt: now,
    eventCreatedAt: input.googleEventId ? now : undefined,
    consultationConfirmedAt: input.googleEventId ? now : undefined,
    consultantInvitedAt: input.googleEventId ? now : undefined,
    memberInvitedAt: input.googleEventId ? now : undefined
  });

  const event: ConsultationEvent = {
    id: recordId,
    meetingId,
    journeyId: ensureMemberJourneyId(input.member.id, input.member.createdAt, input.member.journeyId),
    memberId: input.member.id,
    memberName: input.member.aboutYou.name,
    consultantId: input.consultant.id,
    consultantName: input.consultant.name,
    googleEventId: input.googleEventId,
    googleEventLink: input.googleEventLink,
    scheduledAt: input.slot.startsAt,
    endsAt: input.slot.endsAt,
    durationMinutes: input.slot.durationMinutes,
    channel: input.channel,
    timezone: CALENDAR_DEFAULT_TIMEZONE,
    status: input.googleEventId ? "confirmed" : "scheduled",
    participants,
    timeline,
    createdAt: now,
    updatedAt: now
  };

  saveStore({
    ...store,
    events: { ...store.events, [recordId]: event }
  });
  syncCalendarAvailabilityFromConsultants();
  return event;
}

export function bookConsultationSlot(input: {
  application: SignalConciergeApplication;
  member: ConciergeMemberRecord;
  memberEmail: string;
  consultantId?: string;
  slot: CalendarSlot;
  googleEventId?: string;
  googleEventLink?: string;
  meetingId?: string;
}): ConsultationEvent | null {
  const consultant = resolveConsultant(input.consultantId ?? input.slot.consultantId);
  if (!consultant) return null;

  const channel = mapPreferenceToCalendarChannel(
    input.application.consultationPreferences?.preferredChannel ?? input.application.consultationPreference
  );

  scheduleConsultationMeeting({
    memberId: input.member.id,
    consultantId: consultant.id,
    scheduledAt: input.slot.startsAt,
    channel,
    durationMinutes: input.slot.durationMinutes
  });

  return recordConsultationEvent({
    member: input.member,
    consultant,
    memberEmail: input.memberEmail,
    slot: input.slot,
    channel,
    googleEventId: input.googleEventId,
    googleEventLink: input.googleEventLink,
    meetingId: input.meetingId
  });
}

export function appendConsultationEventTimeline(
  eventId: string,
  entries: CalendarTimelineEntry[]
): ConsultationEvent | null {
  const store = loadStore();
  const existing = getConsultationEvent(eventId);
  if (!existing) return null;

  const next: ConsultationEvent = {
    ...existing,
    timeline: appendCalendarTimelineEntries(existing.timeline, entries),
    updatedAt: new Date().toISOString()
  };
  saveStore({
    ...store,
    events: { ...store.events, [existing.id]: next }
  });
  return next;
}

export function markAvailabilityLoaded(consultantId: string): CalendarAvailability | null {
  const availability = listCalendarAvailability(consultantId)[0];
  if (!availability) return null;
  const at = new Date().toISOString();
  const entry = createCalendarTimelineEntry({
    kind: "availability-loaded",
    label: "Availability Loaded",
    detail: "Consultant availability opened for private booking.",
    at
  });
  void entry;
  return availability;
}

export function resetCalendarStoreForTests(): void {
  writeJson(STORE_KEY, {
    events: {},
    availability: {},
    updatedAt: new Date().toISOString()
  });
}
