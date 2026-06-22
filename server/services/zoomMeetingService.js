import { config } from "../config.js";
import { logObservabilityEvent } from "./observability.js";

const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

export const MEETING_INFRASTRUCTURE_CHANNELS = ["zoom", "google-meet", "phone"];

export const MEETING_INFRASTRUCTURE_DISABLED_CHANNELS = ["whatsapp", "whatsapp-voice"];

export const MEETING_INFRASTRUCTURE_TIMELINE_EVENTS = [
  "meeting-created",
  "meeting-link-generated",
  "meeting-invite-sent",
  "meeting-started",
  "meeting-completed",
  "meeting-cancelled"
];

/** Future-ready — document only, not implemented. */
export const MEETING_INFRASTRUCTURE_FUTURE_CAPABILITIES = [
  "microsoft-teams",
  "webex",
  "private-bamsignal-rooms"
];

export class ZoomMeetingServiceError extends Error {
  code;
  status;

  constructor(message, { code = "zoom_error", status = 503 } = {}) {
    super(message);
    this.name = "ZoomMeetingServiceError";
    this.code = code;
    this.status = status;
  }
}

/** @deprecated Use ZoomMeetingServiceError */
export const ZoomServiceError = ZoomMeetingServiceError;

export function zoomOAuthConfigured() {
  return Boolean(config.zoom?.clientId && config.zoom?.clientSecret);
}

export function zoomMeetingReady() {
  return zoomOAuthConfigured() && Boolean(config.zoom?.accountId);
}

/** @deprecated Use zoomMeetingReady */
export const zoomReady = zoomMeetingReady;

/** @deprecated Use zoomOAuthConfigured */
export const zoomConfigured = zoomOAuthConfigured;

async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function getZoomAccessToken() {
  if (!zoomMeetingReady()) {
    throw new ZoomMeetingServiceError("Zoom is not configured.", { code: "not_configured", status: 503 });
  }

  const credentials = Buffer.from(`${config.zoom.clientId}:${config.zoom.clientSecret}`).toString("base64");
  const url = `${ZOOM_TOKEN_URL}?grant_type=account_credentials&account_id=${encodeURIComponent(config.zoom.accountId)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` }
  });
  const payload = await parseJsonResponse(response);
  if (!response.ok || !payload.access_token) {
    throw new ZoomMeetingServiceError(payload.reason || payload.error || "Unable to obtain Zoom access token.", {
      code: "token_failed",
      status: 503
    });
  }
  return payload.access_token;
}

export async function createZoomMeeting(input) {
  const accessToken = await getZoomAccessToken();
  const response = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      topic: input.topic,
      type: 2,
      start_time: input.startTime,
      duration: input.durationMinutes,
      timezone: input.timezone,
      agenda: input.agenda || "",
      settings: {
        join_before_host: true,
        waiting_room: true,
        approval_type: 2,
        audio: "both"
      }
    })
  });
  const payload = await parseJsonResponse(response);
  if (!response.ok || !payload.join_url) {
    logObservabilityEvent(
      "zoom_meeting_create_failed",
      { status: response.status, error: payload.message || payload.reason || "unknown" },
      "warn"
    );
    throw new ZoomMeetingServiceError(payload.message || "Unable to create Zoom meeting.", {
      code: "meeting_create_failed",
      status: response.status >= 400 && response.status < 500 ? 422 : 503
    });
  }

  return {
    meetingId: String(payload.id || ""),
    joinUrl: payload.join_url,
    startUrl: payload.start_url,
    password: payload.password || undefined
  };
}

export function isProfessionalMeetingChannel(channel = "") {
  const value = String(channel || "").trim().toLowerCase().replace(/_/g, "-");
  return MEETING_INFRASTRUCTURE_CHANNELS.includes(value);
}

export function isDisabledMeetingChannel(channel = "") {
  const value = String(channel || "").trim().toLowerCase().replace(/_/g, "-");
  return MEETING_INFRASTRUCTURE_DISABLED_CHANNELS.includes(value);
}
