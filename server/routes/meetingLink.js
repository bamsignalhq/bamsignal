import { requireMemberAuth } from "../services/memberAuth.js";
import { createGoogleMeetLink, googleMeetReady, GoogleMeetServiceError } from "../services/googleMeetService.js";
import { createZoomMeeting, zoomReady, ZoomServiceError } from "../services/zoomService.js";
import { logObservabilityEvent, observabilityContext } from "../services/observability.js";
import { sanitizeApiErrorForLog } from "../services/errorResponse.js";

const DEFAULT_TIMEZONE = "Africa/Lagos";

const DISABLED_CHANNELS = new Set(["whatsapp", "whatsapp-voice"]);

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

function normalizeChannel(value = "") {
  const channel = String(value || "").trim().toLowerCase().replace(/_/g, "-");
  if (DISABLED_CHANNELS.has(channel)) return "disabled";
  if (channel === "google-meet" || channel === "zoom" || channel === "phone") return channel;
  return null;
}

function buildPhoneAccess(consultantName, consultantPhone) {
  return {
    channel: "phone",
    provider: "phone",
    access: {
      phoneNumber: consultantPhone || undefined,
      dialInInstructions: consultantPhone
        ? `${consultantName} will call you at ${consultantPhone} at the scheduled time.`
        : `${consultantName} will call you privately at the scheduled time.`
    }
  };
}

async function handleGenerate(req, res, body, memberAuth) {
  const channel = normalizeChannel(body.channel);
  if (channel === "disabled") {
    return res.status(422).json({
      ok: false,
      error: "WhatsApp meetings are disabled. Choose Zoom, Google Meet, or Phone."
    });
  }
  if (!channel) {
    return res.status(400).json({ ok: false, error: "A supported meeting channel is required." });
  }

  const memberId = String(body.memberId || memberAuth?.memberId || "").trim();
  const memberName = String(body.memberName || memberAuth?.identity?.name || "").trim();
  const memberEmail = String(memberAuth?.identity?.email || memberAuth?.email || body.memberEmail || "")
    .trim()
    .toLowerCase();
  const consultantId = String(body.consultantId || "").trim();
  const consultantName = String(body.consultantName || "Consultant").trim();
  const consultantEmail = String(body.consultantEmail || "").trim().toLowerCase();
  const consultantPhone = String(body.consultantPhone || "").trim();
  const meetingId = String(body.meetingId || "").trim();
  const consultationEventId = String(body.consultationEventId || body.eventId || "").trim();
  const googleEventId = String(body.googleEventId || "").trim();
  const googleEventLink = String(body.googleEventLink || "").trim();
  const startsAt = String(body.startsAt || body.scheduledAt || "").trim();
  const endsAt = String(body.endsAt || "").trim();
  const timezone = String(body.timezone || DEFAULT_TIMEZONE).trim();
  const durationMinutes = Math.max(15, Math.round(Number(body.durationMinutes || 45)));
  const journeyId = String(body.journeyId || "").trim();

  if (!memberId || !consultantId || !startsAt || !meetingId) {
    return res.status(400).json({ ok: false, error: "Meeting link details are incomplete." });
  }

  const topic = `Signal Concierge consultation — ${memberName}`;
  const agenda = [
    "Private Signal Concierge™ consultation.",
    `Member: ${memberName}`,
    `Consultant: ${consultantName}`,
    journeyId ? `Journey ID: ${journeyId}` : null,
    `Meeting ID: ${meetingId}`
  ]
    .filter(Boolean)
    .join("\n");

  let result;

  if (channel === "phone") {
    result = buildPhoneAccess(consultantName, consultantPhone);
  } else if (channel === "zoom") {
    if (!zoomReady()) {
      return res.status(503).json({ ok: false, error: "Zoom meeting infrastructure is not configured yet." });
    }
    try {
      const zoomMeeting = await createZoomMeeting({
        topic,
        startTime: startsAt,
        durationMinutes,
        timezone,
        agenda
      });
      result = {
        channel: "zoom",
        provider: "zoom",
        access: {
          joinUrl: zoomMeeting.joinUrl,
          password: zoomMeeting.password,
          providerMeetingId: zoomMeeting.meetingId
        }
      };
    } catch (error) {
      const message = error instanceof ZoomServiceError ? error.message : "Unable to create Zoom meeting.";
      return res.status(error instanceof ZoomServiceError ? error.status : 503).json({ ok: false, error: message });
    }
  } else if (channel === "google-meet") {
    if (googleEventLink) {
      result = {
        channel: "google-meet",
        provider: "google-meet",
        access: {
          joinUrl: googleEventLink,
          providerMeetingId: googleEventId || undefined
        }
      };
    } else if (googleMeetReady()) {
      if (!endsAt) {
        return res.status(400).json({ ok: false, error: "Meeting end time is required for Google Meet." });
      }
      try {
        const meet = await createGoogleMeetLink({
          summary: topic,
          description: agenda,
          startsAt,
          endsAt,
          timezone
        });
        result = {
          channel: "google-meet",
          provider: "google-meet",
          access: {
            joinUrl: meet.joinUrl,
            providerMeetingId: meet.eventId
          }
        };
      } catch (error) {
        const message =
          error instanceof GoogleMeetServiceError ? error.message : "Unable to create Google Meet link.";
        return res.status(error instanceof GoogleMeetServiceError ? error.status : 503).json({
          ok: false,
          error: message
        });
      }
    } else {
      return res.status(503).json({ ok: false, error: "Google Meet infrastructure is not configured yet." });
    }
  }

  logObservabilityEvent(
    "meeting_link_generated",
    observabilityContext(req, {
      memberId,
      consultantId,
      meetingId,
      channel,
      consultationEventId: consultationEventId || null
    }),
    "info"
  );

  return res.status(200).json({
    ok: true,
    meetingId,
    consultationEventId: consultationEventId || null,
    googleEventId: googleEventId || null,
    journeyId: journeyId || null,
    memberId,
    memberName,
    memberEmail,
    consultantId,
    consultantName,
    consultantEmail,
    channel: result.channel,
    provider: result.provider,
    access: result.access,
    participants: [
      { role: "consultant", email: consultantEmail, name: consultantName, inviteStatus: "sent" },
      { role: "member", email: memberEmail, name: memberName, inviteStatus: "sent" }
    ],
    notified: true
  });
}

export default async function meetingLinkHandler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const body = parseBody(req);
    const action = String(req.query.action || body.action || "").trim();

    const memberAuth = await requireMemberAuth(req, body);
    if (!memberAuth.ok) {
      return res.status(memberAuth.status || 401).json({ ok: false, error: "not_authorized" });
    }

    if (action === "generate") {
      return handleGenerate(req, res, body, memberAuth);
    }

    return res.status(400).json({ ok: false, error: "Unknown meeting link action." });
  } catch (error) {
    const sanitized = sanitizeApiErrorForLog(error);
    logObservabilityEvent(
      "meeting_link_handler_error",
      observabilityContext(req, {
        error: sanitized.message,
        errorCategory: sanitized.category
      }),
      "error"
    );
    const status =
      error instanceof ZoomServiceError || error instanceof GoogleMeetServiceError ? error.status : 500;
    return res.status(status).json({
      ok: false,
      error:
        error instanceof ZoomServiceError || error instanceof GoogleMeetServiceError
          ? error.message
          : "Meeting link request failed."
    });
  }
}
