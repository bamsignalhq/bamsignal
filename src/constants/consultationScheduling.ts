import type {
  ConsultationEventStatus,
  ConsultationSchedulingTimelineKind
} from "../types/consultationScheduling";

export const CONSULTATION_SCHEDULING_ENGINE_BRAND = "Consultation Scheduling Engine™";

export const CONSULTATION_SCHEDULING_DEFAULT_TIMEZONE = "Africa/Lagos";
export const CONSULTATION_SCHEDULING_DEFAULT_DURATION_MINUTES = 45;
export const CONSULTATION_SCHEDULING_DEFAULT_HORIZON_DAYS = 7;
export const CONSULTATION_SCHEDULING_DEFAULT_DAYS = [1, 2, 3, 4, 5];
export const CONSULTATION_SCHEDULING_DEFAULT_HOURS = [10, 14, 16];

/** Production API path for scheduling initialize/book. */
export const CONSULTATION_SCHEDULING_API_PATH = "/api/consultation-scheduling";
/** @deprecated Use CONSULTATION_SCHEDULING_API_PATH */
export const CALENDAR_API_PATH = "/api/calendar";

export const CONSULTATION_EVENT_STATUS_LABELS: Record<ConsultationEventStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  "no-show": "No-show",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled"
};

export const CONSULTATION_SCHEDULING_TIMELINE_STEPS: {
  kind: ConsultationSchedulingTimelineKind;
  label: string;
  detail: string;
}[] = [
  {
    kind: "slot-selected",
    label: "Slot Selected",
    detail: "Member chose a consultation time."
  },
  {
    kind: "event-created",
    label: "Calendar Event Created",
    detail: "Consultation event created on Google Calendar."
  },
  {
    kind: "consultation-confirmed",
    label: "Consultation Confirmed",
    detail: "Member and consultant received calendar invitations."
  },
  {
    kind: "consultation-completed",
    label: "Consultation Completed",
    detail: "Consultation marked complete."
  },
  {
    kind: "consultation-rescheduled",
    label: "Consultation Rescheduled",
    detail: "Consultation moved to a new time."
  },
  {
    kind: "consultation-cancelled",
    label: "Consultation Cancelled",
    detail: "Consultation booking cancelled."
  }
];

export const CONSULTATION_SCHEDULING_FUTURE_CAPABILITIES = [
  { id: "regional-scheduling-pools" as const, label: "Regional scheduling pools" },
  { id: "family-advisors" as const, label: "Family advisors" },
  { id: "group-consultations" as const, label: "Group consultations" }
];

/**
 * Future-ready architecture hooks — not implemented.
 */
export const CONSULTATION_SCHEDULING_FUTURE_ARCHITECTURE = {
  regionalSchedulingPools: "Shared availability pools across regional consultant teams.",
  familyAdvisors: "Invite family advisors as optional consultation participants.",
  groupConsultations: "Multi-member calendar slots with shared invitations."
} as const;
