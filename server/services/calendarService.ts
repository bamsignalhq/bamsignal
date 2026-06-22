/** Google Calendar integration for Signal Concierge consultations. */

export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly"
] as const;

export type GoogleCalendarConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  calendarRefreshToken?: string;
  calendarId?: string;
};

export type GoogleCalendarEventInput = {
  summary: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  memberEmail: string;
  memberName: string;
  consultantEmail: string;
  consultantName: string;
  location?: string;
};

export type GoogleCalendarEventResult = {
  eventId: string;
  htmlLink?: string;
  hangoutLink?: string;
};
