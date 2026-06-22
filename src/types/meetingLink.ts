import type { CalendarParticipant } from "./calendar";

export type MeetingLinkChannel = "zoom" | "google-meet" | "phone";

export type MeetingLinkProvider = "zoom" | "google-meet" | "phone";

export type MeetingInfrastructureStatus =
  | "scheduled"
  | "ready"
  | "in-progress"
  | "completed"
  | "cancelled";

export type MeetingLinkTimelineKind =
  | "calendar-event-linked"
  | "link-generated"
  | "link-stored"
  | "consultant-notified"
  | "member-notified"
  | "meeting-created"
  | "meeting-link-generated"
  | "meeting-invite-sent"
  | "meeting-started"
  | "meeting-completed"
  | "meeting-cancelled";

export type MeetingLinkTimelineEntry = {
  id: string;
  kind: MeetingLinkTimelineKind;
  label: string;
  detail?: string;
  at: string;
};

export type MeetingLinkAccess = {
  joinUrl?: string;
  phoneNumber?: string;
  dialInInstructions?: string;
  password?: string;
  providerMeetingId?: string;
};

export type MeetingLinkRecord = {
  id: string;
  meetingId: string;
  consultationEventId?: string;
  googleEventId?: string;
  journeyId?: string;
  memberId: string;
  memberName: string;
  consultantId: string;
  consultantName: string;
  channel: MeetingLinkChannel;
  provider: MeetingLinkProvider;
  access: MeetingLinkAccess;
  participants: CalendarParticipant[];
  timeline: MeetingLinkTimelineEntry[];
  status: MeetingInfrastructureStatus;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};

/** Reserved — not implemented. */
export type MeetingLinkFutureCapability = "teams" | "webex" | "private-rooms";

export type MeetingLinkFutureConfig = {
  capability?: MeetingLinkFutureCapability;
  enabled?: boolean;
};
