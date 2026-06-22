import type { CalendarTimelineKind, ConsultationEventStatus } from "../types/calendar";

export const CALENDAR_ENGINE_BRAND = "Calendar Engine™";

export const CALENDAR_DEFAULT_TIMEZONE = "Africa/Lagos";
export const CALENDAR_DEFAULT_DURATION_MINUTES = 45;

export const CALENDAR_EVENT_STATUS_LABELS: Record<ConsultationEventStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  "no-show": "No-show",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled"
};

export const CALENDAR_TIMELINE_STEPS: {
  kind: CalendarTimelineKind;
  label: string;
  detail: string;
}[] = [
  {
    kind: "availability-loaded",
    label: "Availability Loaded",
    detail: "Consultant availability opened for private booking."
  },
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
    kind: "consultant-invited",
    label: "Consultant Invited",
    detail: "Consultant received a calendar invitation."
  },
  {
    kind: "member-invited",
    label: "Member Invited",
    detail: "Member received a calendar invitation."
  }
];

export const CALENDAR_FUTURE_CAPABILITIES = [
  { id: "regional-teams" as const, label: "Regional teams" },
  { id: "group-sessions" as const, label: "Group sessions" },
  { id: "family-advisors" as const, label: "Family advisors" }
];

/**
 * Future-ready architecture hooks — not implemented.
 */
export const CALENDAR_FUTURE_ARCHITECTURE = {
  regionalTeams: "Route availability by region and steward team.",
  groupSessions: "Shared calendar slots for group consultations.",
  familyAdvisors: "Invite family advisors as optional participants."
} as const;
