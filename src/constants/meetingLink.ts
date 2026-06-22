import type { MeetingLinkChannel, MeetingLinkTimelineKind } from "../types/meetingLink";

export const MEETING_LINK_ENGINE_BRAND = "Meeting Link Engine™";

export const MEETING_LINK_CHANNELS: {
  id: MeetingLinkChannel;
  label: string;
  enabled: boolean;
}[] = [
  { id: "zoom", label: "Zoom", enabled: true },
  { id: "google-meet", label: "Google Meet", enabled: true },
  { id: "phone", label: "Phone", enabled: true }
];

export const MEETING_LINK_DISABLED_CHANNELS = [
  { id: "whatsapp" as const, label: "WhatsApp", reason: "Disabled for consultation meetings." },
  { id: "whatsapp-voice" as const, label: "WhatsApp Voice", reason: "Disabled for consultation meetings." }
];

export const MEETING_LINK_CHANNEL_LABELS: Record<MeetingLinkChannel, string> = {
  zoom: "Zoom",
  "google-meet": "Google Meet",
  phone: "Phone"
};

export const MEETING_LINK_TIMELINE_STEPS: {
  kind: MeetingLinkTimelineKind;
  label: string;
  detail: string;
}[] = [
  {
    kind: "calendar-event-linked",
    label: "Calendar Event Linked",
    detail: "Consultation calendar event connected."
  },
  {
    kind: "link-generated",
    label: "Meeting Link Generated",
    detail: "Virtual meeting access prepared."
  },
  {
    kind: "link-stored",
    label: "Meeting Link Stored",
    detail: "Permanent meeting access record saved."
  },
  {
    kind: "consultant-notified",
    label: "Consultant Notified",
    detail: "Steward received meeting access details."
  },
  {
    kind: "member-notified",
    label: "Member Notified",
    detail: "Member received meeting access details."
  }
];

export const MEETING_LINK_FUTURE_CAPABILITIES = [
  { id: "teams" as const, label: "Microsoft Teams" },
  { id: "webex" as const, label: "Webex" },
  { id: "private-rooms" as const, label: "Private rooms" }
];

/**
 * Future-ready architecture hooks — not implemented.
 */
export const MEETING_LINK_FUTURE_ARCHITECTURE = {
  teams: "Enterprise Teams rooms behind the same meeting record.",
  webex: "Alternate video provider adapter.",
  privateRooms: "Dedicated persistent consultation rooms."
} as const;

export function isMeetingLinkChannelEnabled(channel: string): channel is MeetingLinkChannel {
  return MEETING_LINK_CHANNELS.some((item) => item.id === channel && item.enabled);
}

export function normalizeMeetingLinkChannel(channel: string): MeetingLinkChannel | null {
  const value = String(channel || "").trim().toLowerCase();
  if (value === "whatsapp" || value === "whatsapp-voice") return null;
  if (value === "google_meet") return "google-meet";
  if (isMeetingLinkChannelEnabled(value)) return value;
  return null;
}
