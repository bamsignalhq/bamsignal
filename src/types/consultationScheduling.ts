import type { ConsultationChannel } from "./consultationScheduler";

export type ConsultationEventStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "no-show"
  | "rescheduled"
  | "cancelled";

export type ConsultationParticipantRole = "member" | "consultant" | "organizer";

export type ConsultationParticipantInviteStatus = "pending" | "sent" | "accepted";

export type ConsultationParticipant = {
  id: string;
  role: ConsultationParticipantRole;
  name: string;
  email: string;
  memberId?: string;
  consultantId?: string;
  invitedAt?: string;
  inviteStatus?: ConsultationParticipantInviteStatus;
};

export type ConsultationSlot = {
  id: string;
  consultantId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  available: boolean;
};

export type ConsultationBlackoutPeriod = {
  startsAt: string;
  endsAt: string;
  reason?: string;
};

export type ConsultationAvailability = {
  consultantId: string;
  consultantName: string;
  timezone: string;
  availableDays?: number[];
  availableHours?: number[];
  blackoutPeriods?: ConsultationBlackoutPeriod[];
  slots: ConsultationSlot[];
  updatedAt: string;
};

export type ConsultationSchedulingTimelineKind =
  | "slot-selected"
  | "event-created"
  | "consultation-confirmed"
  | "consultation-completed"
  | "consultation-rescheduled"
  | "consultation-cancelled"
  | "availability-loaded"
  | "consultant-invited"
  | "member-invited";

export type ConsultationSchedulingTimelineEntry = {
  id: string;
  kind: ConsultationSchedulingTimelineKind;
  label: string;
  detail?: string;
  at: string;
};

export type ConsultationEvent = {
  id: string;
  meetingId: string;
  journeyId?: string;
  memberId: string;
  memberName: string;
  consultantId: string;
  consultantName: string;
  googleEventId?: string;
  googleEventLink?: string;
  scheduledAt: string;
  endsAt: string;
  durationMinutes: number;
  channel: ConsultationChannel;
  timezone: string;
  status: ConsultationEventStatus;
  participants: ConsultationParticipant[];
  timeline: ConsultationSchedulingTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type ConsultantAvailabilityConfig = {
  consultantId: string;
  timezone: string;
  availableDays: number[];
  availableHours: number[];
  blackoutPeriods: ConsultationBlackoutPeriod[];
  durationMinutes: number;
  horizonDays: number;
  updatedAt: string;
};

/** Reserved — not implemented. */
export type ConsultationSchedulingFutureCapability =
  | "regional-scheduling-pools"
  | "family-advisors"
  | "group-consultations";

export type ConsultationSchedulingFutureConfig = {
  capability?: ConsultationSchedulingFutureCapability;
  enabled?: boolean;
};
