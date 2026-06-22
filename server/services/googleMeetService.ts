/** Google Meet link infrastructure for Signal Concierge consultations. */

export const MEETING_INFRASTRUCTURE_CHANNELS = ["zoom", "google-meet", "phone"] as const;

export type GoogleMeetLinkInput = {
  summary: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
};

export type GoogleMeetLinkResult = {
  eventId: string;
  joinUrl: string;
  htmlLink?: string;
};
