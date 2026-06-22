import { config } from "../config.js";
import { logObservabilityEvent } from "./observability.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export class GoogleMeetServiceError extends Error {
  code;
  status;

  constructor(message, { code = "google_meet_error", status = 503 } = {}) {
    super(message);
    this.name = "GoogleMeetServiceError";
    this.code = code;
    this.status = status;
  }
}

export function googleMeetConfigured() {
  return Boolean(config.googleMeet?.clientId && config.googleMeet?.clientSecret);
}

export function googleMeetReady() {
  return googleMeetConfigured() && Boolean(config.googleMeet?.refreshToken);
}

async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

async function getGoogleMeetAccessToken() {
  if (!googleMeetReady()) {
    throw new GoogleMeetServiceError("Google Meet is not configured.", { code: "not_configured", status: 503 });
  }

  const body = new URLSearchParams({
    client_id: config.googleMeet.clientId,
    client_secret: config.googleMeet.clientSecret,
    refresh_token: config.googleMeet.refreshToken,
    grant_type: "refresh_token"
  });
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const payload = await parseJsonResponse(response);
  if (!response.ok || !payload.access_token) {
    throw new GoogleMeetServiceError(payload.error_description || "Unable to refresh Google Meet access token.", {
      code: "token_failed",
      status: 503
    });
  }
  return payload.access_token;
}

export async function createGoogleMeetLink(input) {
  const accessToken = await getGoogleMeetAccessToken();
  const calendarId = encodeURIComponent(config.googleMeet.calendarId || "primary");
  const requestId = `bamsignal-meet-${Date.now().toString(36)}`;

  const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?conferenceDataVersion=1`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      summary: input.summary,
      description: input.description || "",
      start: { dateTime: input.startsAt, timeZone: input.timezone },
      end: { dateTime: input.endsAt, timeZone: input.timezone },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" }
        }
      }
    })
  });

  const payload = await parseJsonResponse(response);
  if (!response.ok) {
    logObservabilityEvent(
      "google_meet_create_failed",
      { status: response.status, error: payload.error?.message || "unknown" },
      "warn"
    );
    throw new GoogleMeetServiceError(payload.error?.message || "Unable to create Google Meet link.", {
      code: "meet_create_failed",
      status: response.status >= 400 && response.status < 500 ? 422 : 503
    });
  }

  const joinUrl =
    payload.hangoutLink ||
    payload.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === "video")?.uri ||
    payload.htmlLink;

  if (!joinUrl) {
    throw new GoogleMeetServiceError("Google Meet link was not returned.", { code: "missing_join_url", status: 503 });
  }

  return {
    eventId: payload.id,
    joinUrl,
    htmlLink: payload.htmlLink
  };
}
