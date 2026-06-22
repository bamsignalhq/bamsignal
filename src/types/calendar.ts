import type { ConsultationChannel } from "./consultationScheduler";

export type ConsultationEventStatus = "draft" | "scheduled" | "confirmed" | "cancelled";

export type CalendarParticipantRole = "member" | "consultant" | "organizer";

export type CalendarParticipantInviteStatus = "pending" | "sent" | "accepted";

export type CalendarParticipant = {
  id: string;
  role: CalendarParticipantRole;
  name: string;
  email: string;
  memberId?: string;
  consultantId?: string;
  invitedAt?: string;
  inviteStatus?: CalendarParticipantInviteStatus;
};

export type CalendarSlot = {
  id: string;
  consultantId: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  available: boolean;
};

export type CalendarAvailability = {
  consultantId: string;
  consultantName: string;
  timezone: string;
  slots: CalendarSlot[];
  updatedAt: string;
};

export type CalendarTimelineKind =
  | "availability-loaded"
  | "slot-selected"
  | "event-created"
  | "consultant-invited"
  | "member-invited";

export type CalendarTimelineEntry = {
  id: string;
  kind: CalendarTimelineKind;
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
  participants: CalendarParticipant[];
  timeline: CalendarTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

/** Reserved — not implemented. */
export type CalendarFutureCapability = "regional-teams" | "group-sessions" | "family-advisors";

export type CalendarFutureConfig = {
  capability?: CalendarFutureCapability;
  enabled?: boolean;
};
