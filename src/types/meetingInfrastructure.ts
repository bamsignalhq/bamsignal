import type {
  MeetingInfrastructureStatus,
  MeetingLinkChannel,
  MeetingLinkTimelineKind
} from "./meetingLink";

export type MeetingChannel = MeetingLinkChannel;

export type MeetingStatus = MeetingInfrastructureStatus;

export type MeetingParticipant = import("./calendar").CalendarParticipant;

export type MeetingTimelineKind = MeetingLinkTimelineKind;

export type MeetingTimelineEntry = import("./meetingLink").MeetingLinkTimelineEntry;

export type MeetingRecord = import("./meetingLink").MeetingLinkRecord;

export type MeetingAccess = import("./meetingLink").MeetingLinkAccess;

/** Reserved — not implemented. */
export type MeetingInfrastructureFutureCapability =
  | "microsoft-teams"
  | "webex"
  | "private-bamsignal-rooms";

export type MeetingInfrastructureFutureConfig = {
  capability?: MeetingInfrastructureFutureCapability;
  enabled?: boolean;
};
