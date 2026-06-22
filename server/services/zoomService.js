import { config } from "../config.js";
import { logObservabilityEvent } from "./observability.js";

const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

export class ZoomServiceError extends Error {
  code;
  status;

  constructor(message, { code = "zoom_error", status = 503 } = {}) {
    super(message);
    this.name = "ZoomServiceError";
    this.code = code;
    this.status = status;
  }
}

export function zoomConfigured() {
  return Boolean(config.zoom?.clientId && config.zoom?.clientSecret);
}

export function zoomReady() {
  return zoomConfigured() && Boolean(config.zoom?.accountId);
}

async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function getZoomAccessToken() {
  if (!zoomReady()) {
    throw new ZoomServiceError("Zoom is not configured.", { code: "not_configured", status: 503 });
  }

  const credentials = Buffer.from(`${config.zoom.clientId}:${config.zoom.clientSecret}`).toString("base64");
  const url = `${ZOOM_TOKEN_URL}?grant_type=account_credentials&account_id=${encodeURIComponent(config.zoom.accountId)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` }
  });
  const payload = await parseJsonResponse(response);
  if (!response.ok || !payload.access_token) {
    throw new ZoomServiceError(payload.reason || payload.error || "Unable to obtain Zoom access token.", {
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
    throw new ZoomServiceError(payload.message || "Unable to create Zoom meeting.", {
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
