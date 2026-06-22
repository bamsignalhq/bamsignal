/**
 * Google Calendar service — Consultation Scheduling Engine™ production integration.
 * One-time consultation booking via Google Calendar events and invitations.
 */

export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly"
] as const;

export type ConsultationSchedulingTimelineEvent =
  | "slot-selected"
  | "event-created"
  | "consultation-confirmed"
  | "consultation-completed"
  | "consultation-rescheduled"
  | "consultation-cancelled";

export const CONSULTATION_SCHEDULING_TIMELINE_EVENTS: ConsultationSchedulingTimelineEvent[] = [
  "slot-selected",
  "event-created",
  "consultation-confirmed",
  "consultation-completed",
  "consultation-rescheduled",
  "consultation-cancelled"
];

export type ConsultationEventStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "no-show"
  | "rescheduled"
  | "cancelled";

export type ConsultationBlackoutPeriod = {
  startsAt: string;
  endsAt: string;
  reason?: string;
};

export type ConsultantAvailabilityConfig = {
  timezone: string;
  availableDays: number[];
  availableHours: number[];
  blackoutPeriods: ConsultationBlackoutPeriod[];
  durationMinutes?: number;
  horizonDays?: number;
};

/**
 * Future-ready architecture — document only, not implemented:
 * - regional-scheduling-pools: shared availability across regional consultant teams
 * - family-advisors: optional advisor participants on consultation events
 * - group-consultations: multi-member calendar slots
 */
export const CONSULTATION_SCHEDULING_FUTURE_CAPABILITIES = [
  "regional-scheduling-pools",
  "family-advisors",
  "group-consultations"
] as const;
