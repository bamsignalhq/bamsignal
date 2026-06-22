/** Zoom meeting infrastructure — Consultation Meeting Infrastructure™ */

export type ZoomMeetingInput = {
  topic: string;
  startTime: string;
  durationMinutes: number;
  timezone: string;
  agenda?: string;
};

export type ZoomMeetingResult = {
  meetingId: string;
  joinUrl: string;
  startUrl?: string;
  password?: string;
};

export type MeetingInfrastructureChannel = "zoom" | "google-meet" | "phone";

export type MeetingInfrastructureStatus =
  | "scheduled"
  | "ready"
  | "in-progress"
  | "completed"
  | "cancelled";

export type MeetingInfrastructureTimelineEvent =
  | "meeting-created"
  | "meeting-link-generated"
  | "meeting-invite-sent"
  | "meeting-started"
  | "meeting-completed"
  | "meeting-cancelled";

/**
 * Future-ready — document only:
 * - microsoft-teams, webex, private-bamsignal-rooms
 */
export const MEETING_INFRASTRUCTURE_FUTURE_CAPABILITIES = [
  "microsoft-teams",
  "webex",
  "private-bamsignal-rooms"
] as const;
