import {
  CONSULTATION_SCHEDULING_TIMELINE_STEPS
} from "../constants/consultationScheduling";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConsultationEventStatus } from "../types/consultationScheduling";
import type {
  ConsultationAvailability,
  ConsultationEvent,
  ConsultationSchedulingTimelineEntry,
  ConsultationSchedulingTimelineKind,
  ConsultationSlot
} from "../types/consultationScheduling";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import {
  appendConsultationEventTimeline,
  bookConsultationSlot,
  getConsultationEvent,
  getUpcomingConsultationEventForMember,
  listAvailableCalendarSlots,
  listCalendarAvailability,
  listConsultationEvents,
  syncCalendarAvailabilityFromConsultants
} from "./CalendarEngine";
import {
  defaultConsultantAvailabilityConfig,
  getConsultantAvailabilityConfig,
  saveConsultantAvailabilityConfig as persistConsultantAvailabilityConfig,
  resetConsultantAvailabilityConfigStoreForTests
} from "./consultationSchedulingAvailabilityStore";
import { createCalendarTimelineEntry } from "./calendarLogic";
import { readJson, writeJson } from "./storage";

export {
  defaultConsultantAvailabilityConfig,
  getConsultantAvailabilityConfig
} from "./consultationSchedulingAvailabilityStore";

export function saveConsultantAvailabilityConfig(
  config: Omit<import("../types/consultationScheduling").ConsultantAvailabilityConfig, "updatedAt"> & {
    updatedAt?: string;
  }
) {
  const next = persistConsultantAvailabilityConfig(config);
  syncSchedulingAvailability();
  return next;
}

export function syncSchedulingAvailability(): ConsultationAvailability[] {
  return syncCalendarAvailabilityFromConsultants() as ConsultationAvailability[];
}

export function listSchedulingAvailability(consultantId?: string): ConsultationAvailability[] {
  return listCalendarAvailability(consultantId) as ConsultationAvailability[];
}

export function listOpenConsultationSlots(consultantId: string): ConsultationSlot[] {
  return listAvailableCalendarSlots(consultantId) as ConsultationSlot[];
}

export function listSchedulingEvents(): ConsultationEvent[] {
  return listConsultationEvents() as ConsultationEvent[];
}

export function getSchedulingEvent(id: string): ConsultationEvent | null {
  return getConsultationEvent(id) as ConsultationEvent | null;
}

export function getUpcomingSchedulingEventForMember(memberId: string): ConsultationEvent | null {
  return getUpcomingConsultationEventForMember(memberId) as ConsultationEvent | null;
}

export function listSchedulingEventsByStatus(
  status: ConsultationEventStatus | ConsultationEventStatus[]
): ConsultationEvent[] {
  const statuses = new Set(Array.isArray(status) ? status : [status]);
  return listSchedulingEvents().filter((event) => statuses.has(event.status));
}

function timelineForStatus(status: ConsultationEventStatus, at: string): ConsultationSchedulingTimelineEntry | null {
  const step = CONSULTATION_SCHEDULING_TIMELINE_STEPS.find((item) => {
    if (status === "confirmed") return item.kind === "consultation-confirmed";
    if (status === "completed") return item.kind === "consultation-completed";
    if (status === "rescheduled") return item.kind === "consultation-rescheduled";
    if (status === "cancelled" || status === "no-show") return item.kind === "consultation-cancelled";
    return false;
  });
  if (!step) return null;
  return {
    id: `sched_tl_${step.kind}_${Date.parse(at)}`,
    kind: step.kind as ConsultationSchedulingTimelineKind,
    label: step.label,
    detail: status === "no-show" ? "Member did not attend the scheduled consultation." : step.detail,
    at
  };
}

export function updateSchedulingEventStatus(
  eventId: string,
  status: ConsultationEventStatus
): ConsultationEvent | null {
  const existing = getSchedulingEvent(eventId);
  if (!existing) return null;

  const at = new Date().toISOString();
  const entry = timelineForStatus(status, at);
  const timelineEntry = entry
    ? createCalendarTimelineEntry({
        kind: entry.kind as import("../types/calendar").CalendarTimelineKind,
        label: entry.label,
        detail: entry.detail,
        at: entry.at
      })
    : null;

  const updated = appendConsultationEventTimeline(
    existing.id,
    timelineEntry ? [timelineEntry] : []
  );
  if (!updated) return null;

  const next: ConsultationEvent = {
    ...(updated as ConsultationEvent),
    status,
    updatedAt: at
  };

  const store = readJson<{ events: Record<string, ConsultationEvent>; availability: Record<string, ConsultationAvailability>; updatedAt: string }>(
    STORAGE_KEYS.conciergeCalendarStore,
    { events: {}, availability: {}, updatedAt: at }
  );
  writeJson(STORAGE_KEYS.conciergeCalendarStore, {
    ...store,
    events: { ...store.events, [existing.id]: next },
    updatedAt: at
  });
  syncSchedulingAvailability();
  return next;
}

export function bookConsultationSchedulingSlot(input: {
  application: SignalConciergeApplication;
  member: ConciergeMemberRecord;
  memberEmail: string;
  consultantId?: string;
  slot: ConsultationSlot;
  googleEventId?: string;
  googleEventLink?: string;
  meetingId?: string;
}): ConsultationEvent | null {
  return bookConsultationSlot({
    ...input,
    slot: input.slot as import("../types/calendar").CalendarSlot
  }) as ConsultationEvent | null;
}

export function resetConsultationSchedulingStoreForTests(): void {
  resetConsultantAvailabilityConfigStoreForTests();
}
