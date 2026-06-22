import { config } from "../config.js";
import { logObservabilityEvent } from "./observability.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export const GOOGLE_OAUTH_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly"
];

export const CONSULTATION_SCHEDULING_TIMELINE_EVENTS = [
  "slot-selected",
  "event-created",
  "consultation-confirmed",
  "consultation-completed",
  "consultation-rescheduled",
  "consultation-cancelled"
];

/** Future-ready — document only, not implemented. */
export const CONSULTATION_SCHEDULING_FUTURE_CAPABILITIES = [
  "regional-scheduling-pools",
  "family-advisors",
  "group-consultations"
];

export const DEFAULT_AVAILABILITY_DAYS = [1, 2, 3, 4, 5];
export const DEFAULT_AVAILABILITY_HOURS = [10, 14, 16];
export const DEFAULT_SCHEDULING_TIMEZONE = "Africa/Lagos";
export const DEFAULT_SLOT_DURATION_MINUTES = 45;
export const DEFAULT_AVAILABILITY_HORIZON_DAYS = 7;

export class GoogleCalendarServiceError extends Error {
  code;
  status;

  constructor(message, { code = "calendar_error", status = 503 } = {}) {
    super(message);
    this.name = "GoogleCalendarServiceError";
    this.code = code;
    this.status = status;
  }
}

/** @deprecated Use GoogleCalendarServiceError */
export const CalendarServiceError = GoogleCalendarServiceError;

export function googleOAuthConfigured() {
  return Boolean(config.google?.clientId && config.google?.clientSecret && config.google?.redirectUri);
}

export function googleCalendarReady() {
  return googleOAuthConfigured() && Boolean(config.google?.calendarRefreshToken);
}

export function buildGoogleOAuthUrl(state = "bamsignal-calendar") {
  if (!googleOAuthConfigured()) {
    throw new GoogleCalendarServiceError("Google OAuth is not configured.", {
      code: "not_configured",
      status: 503
    });
  }
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: "code",
    scope: GOOGLE_OAUTH_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function parseGoogleResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function exchangeGoogleOAuthCode(code) {
  if (!googleOAuthConfigured()) {
    throw new GoogleCalendarServiceError("Google OAuth is not configured.", {
      code: "not_configured",
      status: 503
    });
  }
  const body = new URLSearchParams({
    code: String(code || "").trim(),
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    redirect_uri: config.google.redirectUri,
    grant_type: "authorization_code"
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const payload = await parseGoogleResponse(response);
  if (!response.ok) {
    throw new GoogleCalendarServiceError(payload.error_description || "Google OAuth exchange failed.", {
      code: "oauth_exchange_failed",
      status: response.status >= 400 && response.status < 500 ? 400 : 503
    });
  }
  return payload;
}

async function getGoogleAccessToken() {
  if (!googleCalendarReady()) {
    throw new GoogleCalendarServiceError("Google Calendar is not ready.", { code: "not_configured", status: 503 });
  }
  const body = new URLSearchParams({
    client_id: config.google.clientId,
    client_secret: config.google.clientSecret,
    refresh_token: config.google.calendarRefreshToken,
    grant_type: "refresh_token"
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const payload = await parseGoogleResponse(response);
  if (!response.ok || !payload.access_token) {
    throw new GoogleCalendarServiceError(payload.error_description || "Unable to refresh Google access token.", {
      code: "token_refresh_failed",
      status: 503
    });
  }
  return payload.access_token;
}

function channelLocation(channel) {
  if (channel === "google-meet") return "Google Meet";
  if (channel === "zoom") return "Zoom";
  if (channel === "phone") return "Phone consultation";
  if (channel === "whatsapp-voice") return "WhatsApp Voice";
  return "Signal Concierge consultation";
}

export async function createConsultationCalendarEvent(input) {
  const accessToken = await getGoogleAccessToken();
  const calendarId = encodeURIComponent(config.google.calendarId || "primary");
  const body = {
    summary: input.summary,
    description: input.description || "",
    start: {
      dateTime: input.startsAt,
      timeZone: input.timezone
    },
    end: {
      dateTime: input.endsAt,
      timeZone: input.timezone
    },
    location: input.location,
    attendees: [
      { email: input.consultantEmail, displayName: input.consultantName },
      { email: input.memberEmail, displayName: input.memberName }
    ],
    reminders: {
      useDefault: true
    },
    conferenceData:
      input.location === "Google Meet"
        ? {
            createRequest: {
              requestId: `bamsignal-${Date.now().toString(36)}`,
              conferenceSolutionKey: { type: "hangoutsMeet" }
            }
          }
        : undefined
  };

  const url = new URL(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`);
  url.searchParams.set("sendUpdates", "all");
  if (body.conferenceData) {
    url.searchParams.set("conferenceDataVersion", "1");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = await parseGoogleResponse(response);
  if (!response.ok) {
    logObservabilityEvent(
      "calendar_event_create_failed",
      { status: response.status, error: payload.error?.message || payload.error || "unknown" },
      "warn"
    );
    throw new GoogleCalendarServiceError(payload.error?.message || "Unable to create Google Calendar event.", {
      code: "event_create_failed",
      status: response.status >= 400 && response.status < 500 ? 422 : 503
    });
  }

  return {
    eventId: payload.id,
    htmlLink: payload.htmlLink,
    hangoutLink: payload.hangoutLink || payload.conferenceData?.entryPoints?.[0]?.uri
  };
}

export function buildConsultationEventPayload(input) {
  const location = channelLocation(input.channel);
  return {
    summary: `Signal Concierge consultation — ${input.memberName}`,
    description: [
      "Private Signal Concierge™ consultation.",
      `Member: ${input.memberName}`,
      `Consultant: ${input.consultantName}`,
      `Channel: ${location}`,
      input.journeyId ? `Journey ID: ${input.journeyId}` : null,
      input.meetingId ? `Meeting ID: ${input.meetingId}` : null
    ]
      .filter(Boolean)
      .join("\n"),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    timezone: input.timezone,
    memberEmail: input.memberEmail,
    memberName: input.memberName,
    consultantEmail: input.consultantEmail,
    consultantName: input.consultantName,
    location
  };
}

function isBlackoutPeriod(startsAt, blackoutPeriods = []) {
  const startMs = new Date(startsAt).getTime();
  return blackoutPeriods.some((period) => {
    const from = Date.parse(period.startsAt);
    const to = Date.parse(period.endsAt);
    if (Number.isNaN(from) || Number.isNaN(to)) return false;
    return startMs >= from && startMs < to;
  });
}

export function normalizeAvailabilityConfig(input = {}) {
  const availableDays = Array.isArray(input.availableDays)
    ? input.availableDays.map((day) => Number(day)).filter((day) => day >= 0 && day <= 6)
    : DEFAULT_AVAILABILITY_DAYS;
  const availableHours = Array.isArray(input.availableHours)
    ? input.availableHours.map((hour) => Number(hour)).filter((hour) => hour >= 0 && hour <= 23)
    : DEFAULT_AVAILABILITY_HOURS;
  const blackoutPeriods = Array.isArray(input.blackoutPeriods)
    ? input.blackoutPeriods
        .map((period) => ({
          startsAt: String(period?.startsAt || "").trim(),
          endsAt: String(period?.endsAt || "").trim(),
          reason: period?.reason ? String(period.reason) : undefined
        }))
        .filter((period) => period.startsAt && period.endsAt)
    : [];

  return {
    timezone: String(input.timezone || DEFAULT_SCHEDULING_TIMEZONE).trim() || DEFAULT_SCHEDULING_TIMEZONE,
    availableDays: availableDays.length ? availableDays : DEFAULT_AVAILABILITY_DAYS,
    availableHours: availableHours.length ? availableHours : DEFAULT_AVAILABILITY_HOURS,
    blackoutPeriods,
    durationMinutes: Math.max(15, Number(input.durationMinutes || DEFAULT_SLOT_DURATION_MINUTES)),
    horizonDays: Math.max(1, Math.min(30, Number(input.horizonDays || DEFAULT_AVAILABILITY_HORIZON_DAYS)))
  };
}

export function buildAvailabilitySlotsFromConfig({
  consultantId,
  consultantName,
  timezone,
  bookedStartsAt = [],
  availabilityConfig = {}
}) {
  const configNormalized = normalizeAvailabilityConfig({ ...availabilityConfig, timezone });
  const now = new Date();
  const booked = new Set(bookedStartsAt);
  const slots = [];

  for (let day = 0; day < configNormalized.horizonDays; day += 1) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    if (!configNormalized.availableDays.includes(date.getDay())) continue;

    for (const hour of configNormalized.availableHours) {
      const slotDate = new Date(date);
      slotDate.setHours(hour, 0, 0, 0);
      const startsAt = slotDate.toISOString();
      const endsAt = new Date(
        slotDate.getTime() + configNormalized.durationMinutes * 60_000
      ).toISOString();
      if (new Date(startsAt).getTime() < now.getTime()) continue;
      if (isBlackoutPeriod(startsAt, configNormalized.blackoutPeriods)) continue;

      slots.push({
        id: `sched_slot_${consultantId}_${day}_${hour}`,
        consultantId,
        startsAt,
        endsAt,
        durationMinutes: configNormalized.durationMinutes,
        available: !booked.has(startsAt)
      });
    }
  }

  return {
    consultantId,
    consultantName,
    timezone: configNormalized.timezone,
    availableDays: configNormalized.availableDays,
    availableHours: configNormalized.availableHours,
    blackoutPeriods: configNormalized.blackoutPeriods,
    slots,
    updatedAt: new Date().toISOString()
  };
}

/** @deprecated Use buildAvailabilitySlotsFromConfig */
export function buildServerAvailabilitySlots(input) {
  return buildAvailabilitySlotsFromConfig(input);
}
