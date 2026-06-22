/** @deprecated Import from googleCalendarService.js — retained for backward compatibility. */
export {
  GOOGLE_OAUTH_SCOPES,
  GoogleCalendarServiceError as CalendarServiceError,
  googleOAuthConfigured,
  googleCalendarReady,
  buildGoogleOAuthUrl,
  exchangeGoogleOAuthCode,
  createConsultationCalendarEvent,
  buildConsultationEventPayload,
  buildServerAvailabilitySlots,
  buildAvailabilitySlotsFromConfig,
  normalizeAvailabilityConfig,
  DEFAULT_AVAILABILITY_DAYS,
  DEFAULT_AVAILABILITY_HOURS,
  DEFAULT_SCHEDULING_TIMEZONE,
  DEFAULT_SLOT_DURATION_MINUTES
} from "./googleCalendarService.js";
