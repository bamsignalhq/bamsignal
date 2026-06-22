import type { MeetingInfrastructureStatus, MeetingLinkTimelineKind } from "../types/meetingLink";

export const MEETING_INFRASTRUCTURE_BRAND = "Meeting Infrastructure™";

export const MEETING_INFRASTRUCTURE_API_PATH = "/api/meeting-infrastructure";
/** @deprecated Use MEETING_INFRASTRUCTURE_API_PATH */
export const MEETING_LINK_API_PATH = "/api/meeting-link";

export const MEETING_CHANNELS: { id: import("../types/meetingLink").MeetingLinkChannel; label: string }[] = [
  { id: "zoom", label: "Zoom" },
  { id: "google-meet", label: "Google Meet" },
  { id: "phone", label: "Phone" }
];

export const MEETING_DISABLED_CHANNELS = [
  { id: "whatsapp" as const, label: "WhatsApp" },
  { id: "whatsapp-voice" as const, label: "WhatsApp Voice" }
];

export const MEETING_STATUS_LABELS: Record<MeetingInfrastructureStatus, string> = {
  scheduled: "Scheduled",
  ready: "Ready",
  "in-progress": "In progress",
  completed: "Completed",
  cancelled: "Cancelled"
};

export const MEETING_INFRASTRUCTURE_TIMELINE_STEPS: {
  kind: MeetingLinkTimelineKind;
  label: string;
  detail: string;
}[] = [
  { kind: "meeting-created", label: "Meeting Created", detail: "Consultation meeting record opened." },
  {
    kind: "meeting-link-generated",
    label: "Meeting Link Generated",
    detail: "Secure virtual meeting access prepared."
  },
  {
    kind: "meeting-invite-sent",
    label: "Meeting Invite Sent",
    detail: "Access details sent via Email Engine™ and WhatsApp Engine™."
  },
  { kind: "meeting-started", label: "Meeting Started", detail: "Consultation session began." },
  { kind: "meeting-completed", label: "Meeting Completed", detail: "Consultation session completed." },
  { kind: "meeting-cancelled", label: "Meeting Cancelled", detail: "Consultation meeting cancelled." }
];

export const MEETING_INFRASTRUCTURE_FUTURE_CAPABILITIES = [
  { id: "microsoft-teams" as const, label: "Microsoft Teams" },
  { id: "webex" as const, label: "Webex" },
  { id: "private-bamsignal-rooms" as const, label: "Private BamSignal rooms" }
];

export const MEETING_INFRASTRUCTURE_FUTURE_ARCHITECTURE = {
  microsoftTeams: "Enterprise Teams rooms behind the same meeting record.",
  webex: "Alternate video provider adapter.",
  privateBamsignalRooms: "Dedicated persistent BamSignal consultation rooms."
} as const;
