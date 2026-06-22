import { requireMemberAuth } from "../services/memberAuth.js";
import {
  buildAvailabilitySlotsFromConfig,
  buildConsultationEventPayload,
  createConsultationCalendarEvent,
  exchangeGoogleOAuthCode,
  googleCalendarReady,
  googleOAuthConfigured,
  GoogleCalendarServiceError
} from "../services/googleCalendarService.js";
import { logObservabilityEvent, observabilityContext } from "../services/observability.js";
import { sanitizeApiErrorForLog } from "../services/errorResponse.js";

const DEFAULT_TIMEZONE = "Africa/Lagos";
const DEFAULT_DURATION_MINUTES = 45;

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

async function handleAvailability(req, res, body) {
  const consultantId = String(body.consultantId || "").trim();
  const consultantName = String(body.consultantName || "Consultant").trim();
  const timezone = String(body.timezone || DEFAULT_TIMEZONE).trim();
  const bookedStartsAt = Array.isArray(body.bookedStartsAt)
    ? body.bookedStartsAt.map((value) => String(value))
    : [];

  if (!consultantId) {
    return res.status(400).json({ ok: false, error: "Consultant ID is required." });
  }

  const availability = buildAvailabilitySlotsFromConfig({
    consultantId,
    consultantName,
    timezone,
    bookedStartsAt,
    availabilityConfig: {
      timezone,
      availableDays: body.availableDays,
      availableHours: body.availableHours,
      blackoutPeriods: body.blackoutPeriods,
      durationMinutes: Number(body.durationMinutes || DEFAULT_DURATION_MINUTES),
      horizonDays: body.horizonDays
    }
  });

  return res.status(200).json({
    ok: true,
    availability,
    googleCalendarReady: googleCalendarReady()
  });
}

async function handleBook(req, res, body, memberAuth) {
  const memberEmail = String(memberAuth?.identity?.email || memberAuth?.email || body.memberEmail || "")
    .trim()
    .toLowerCase();
  const memberId = String(body.memberId || memberAuth?.memberId || "").trim();
  const memberName = String(body.memberName || memberAuth?.identity?.name || "").trim();
  const consultantId = String(body.consultantId || "").trim();
  const consultantName = String(body.consultantName || "Consultant").trim();
  const consultantEmail = String(body.consultantEmail || "").trim().toLowerCase();
  const startsAt = String(body.startsAt || body.scheduledAt || "").trim();
  const endsAt = String(body.endsAt || "").trim();
  const timezone = String(body.timezone || DEFAULT_TIMEZONE).trim();
  const channel = String(body.channel || "google-meet").trim();
  const meetingId = String(body.meetingId || "").trim();
  const journeyId = String(body.journeyId || "").trim();

  if (!memberEmail) {
    return res.status(400).json({ ok: false, error: "A verified email is required to book a consultation." });
  }
  if (!memberId || !consultantId || !startsAt || !endsAt) {
    return res.status(400).json({ ok: false, error: "Consultation booking details are incomplete." });
  }
  if (!consultantEmail) {
    return res.status(400).json({ ok: false, error: "Consultant email is required for calendar invitations." });
  }

  const eventInput = buildConsultationEventPayload({
    memberName,
    consultantName,
    memberEmail,
    consultantEmail,
    startsAt,
    endsAt,
    timezone,
    channel,
    meetingId,
    journeyId
  });

  let googleEvent = null;

  if (googleCalendarReady()) {
    try {
      googleEvent = await createConsultationCalendarEvent(eventInput);
      logObservabilityEvent(
        "consultation_scheduling_event_created",
        observabilityContext(req, {
          memberId,
          consultantId,
          journeyId: journeyId || null,
          eventId: googleEvent.eventId,
          meetingId: meetingId || null
        }),
        "info"
      );
    } catch (error) {
      const googleError =
        error instanceof GoogleCalendarServiceError ? error.message : "Google Calendar event failed.";
      logObservabilityEvent(
        "consultation_scheduling_event_failed",
        observabilityContext(req, {
          memberId,
          consultantId,
          error: googleError
        }),
        "warn"
      );
      return res.status(error instanceof GoogleCalendarServiceError ? error.status : 503).json({
        ok: false,
        error: googleError
      });
    }
  } else if (!googleOAuthConfigured()) {
    return res.status(503).json({ ok: false, error: "Google Calendar is not configured yet." });
  } else {
    return res.status(503).json({
      ok: false,
      error: "Google Calendar refresh token is not configured yet."
    });
  }

  return res.status(200).json({
    ok: true,
    googleEventId: googleEvent?.eventId,
    googleEventLink: googleEvent?.htmlLink || googleEvent?.hangoutLink,
    scheduledAt: startsAt,
    endsAt,
    memberId,
    consultantId,
    meetingId: meetingId || null,
    journeyId: journeyId || null,
    status: "confirmed",
    participants: [
      { role: "consultant", email: consultantEmail, name: consultantName, inviteStatus: "sent" },
      { role: "member", email: memberEmail, name: memberName, inviteStatus: "sent" }
    ]
  });
}

async function handleOAuthCallback(req, res) {
  const code = String(req.query.code || "").trim();
  if (!code) {
    return res.status(400).json({ ok: false, error: "OAuth code is required." });
  }
  try {
    const tokens = await exchangeGoogleOAuthCode(code);
    return res.status(200).json({
      ok: true,
      hasRefreshToken: Boolean(tokens.refresh_token),
      message: tokens.refresh_token
        ? "Google Calendar connected. Store GOOGLE_CALENDAR_REFRESH_TOKEN in production secrets."
        : "Google OAuth completed. Re-authorize with prompt=consent if refresh token is missing."
    });
  } catch (error) {
    const message = error instanceof GoogleCalendarServiceError ? error.message : "Google OAuth failed.";
    return res.status(error instanceof GoogleCalendarServiceError ? error.status : 503).json({
      ok: false,
      error: message
    });
  }
}

export default async function consultationSchedulingHandler(req, res) {
  try {
    const action = String(req.query.action || "").trim();

    if (req.method === "GET" && action === "oauth-callback") {
      return handleOAuthCallback(req, res);
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = parseBody(req);

    if (action === "availability") {
      return handleAvailability(req, res, body);
    }

    if (action === "book") {
      const memberAuth = await requireMemberAuth(req, body);
      if (!memberAuth.ok) {
        return res.status(memberAuth.status || 401).json({ ok: false, error: "not_authorized" });
      }
      return handleBook(req, res, body, memberAuth);
    }

    return res.status(400).json({ ok: false, error: "Unknown consultation scheduling action." });
  } catch (error) {
    const sanitized = sanitizeApiErrorForLog(error);
    logObservabilityEvent(
      "consultation_scheduling_handler_error",
      observabilityContext(req, {
        error: sanitized.message,
        errorCategory: sanitized.category
      }),
      "error"
    );
    const status = error instanceof GoogleCalendarServiceError ? error.status : 500;
    return res.status(status).json({
      ok: false,
      error: error instanceof GoogleCalendarServiceError ? error.message : "Scheduling request failed."
    });
  }
}
