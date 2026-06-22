import { requireMemberAuth } from "../services/memberAuth.js";
import {
  buildConciergeWhatsappPreview,
  sendConciergeWhatsappNotification
} from "../services/whatsappService.js";
import { logObservabilityEvent, observabilityContext } from "../services/observability.js";
import { sanitizeApiErrorForLog } from "../services/errorResponse.js";

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

async function handleSend(req, res, body, memberAuth) {
  const memberId = String(body.memberId || memberAuth?.memberId || "").trim();
  const memberName = String(body.memberName || memberAuth?.identity?.name || "").trim();
  const memberPhone = String(body.memberPhone || body.phone || memberAuth?.identity?.phone || "").trim();
  const templateId = String(body.templateId || "").trim();
  const journeyId = String(body.journeyId || "").trim();
  const messageId = String(body.messageId || "").trim();
  const variables =
    body.variables && typeof body.variables === "object" ? body.variables : {};

  if (!memberId) {
    return res.status(400).json({ ok: false, error: "Member ID is required." });
  }
  if (!templateId) {
    return res.status(400).json({ ok: false, error: "WhatsApp template is required." });
  }

  const result = await sendConciergeWhatsappNotification({
    templateId,
    to: memberPhone,
    memberId,
    memberName,
    journeyId: journeyId || undefined,
    messageId: messageId || undefined,
    variables
  });

  if (result.skipped) {
    return res.status(503).json({
      ok: false,
      skipped: true,
      reason: result.reason,
      messageId: result.messageId,
      templateId: result.templateId,
      preview: result.preview,
      timeline: result.timeline
    });
  }

  if (!result.ok) {
    const clientError = new Set([
      "invalid_template",
      "missing_member",
      "freeform_whatsapp_not_allowed",
      "whatsapp_content_not_operational",
      "whatsapp_variable_too_long"
    ]);
    const status = clientError.has(result.error) ? 400 : 502;
    return res.status(status).json({
      ok: false,
      error: result.error || "whatsapp_send_failed",
      messageId: result.messageId,
      templateId: result.templateId,
      preview: result.preview,
      timeline: result.timeline
    });
  }

  return res.status(200).json({
    ok: true,
    messageId: result.messageId,
    templateId: result.templateId,
    preview: result.preview,
    sendchampReference: result.sendchampReference,
    timeline: result.timeline
  });
}

async function handlePreview(req, res, body) {
  const templateId = String(body.templateId || "").trim();
  const variables =
    body.variables && typeof body.variables === "object" ? body.variables : {};
  const preview = buildConciergeWhatsappPreview(templateId, variables);

  if (!preview) {
    return res.status(400).json({ ok: false, error: "WhatsApp template is required." });
  }

  return res.status(200).json({ ok: true, ...preview });
}

export default async function conciergeWhatsappHandler(req, res) {
  const action = String(req.query?.action || req.body?.action || "send")
    .trim()
    .toLowerCase();
  const body = parseBody(req);

  try {
    if (action === "preview") {
      return handlePreview(req, res, body);
    }

    if (action !== "send") {
      return res.status(400).json({ ok: false, error: "Unsupported action." });
    }

    const memberAuth = await requireMemberAuth(req);
    if (!memberAuth?.memberId) {
      return res.status(401).json({ ok: false, error: "Authentication required." });
    }

    return handleSend(req, res, body, memberAuth);
  } catch (error) {
    logObservabilityEvent(
      "concierge_whatsapp_route_error",
      {
        ...observabilityContext(req),
        action,
        error: sanitizeApiErrorForLog(error)
      },
      "error"
    );
    return res.status(500).json({ ok: false, error: "Unable to process WhatsApp notification request." });
  }
}
