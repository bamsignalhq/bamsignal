import { requireMemberAuth } from "../services/memberAuth.js";
import {
  buildConciergeEmailPreview,
  sendConciergeJourneyEmail
} from "../services/conciergeEmailService.js";
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
  const memberEmail = String(
    body.memberEmail || memberAuth?.identity?.email || memberAuth?.email || ""
  )
    .trim()
    .toLowerCase();
  const templateId = String(body.templateId || "").trim();
  const journeyId = String(body.journeyId || "").trim();
  const emailId = String(body.emailId || "").trim();
  const variables =
    body.variables && typeof body.variables === "object" ? body.variables : {};

  if (!memberId) {
    return res.status(400).json({ ok: false, error: "Member ID is required." });
  }
  if (!templateId) {
    return res.status(400).json({ ok: false, error: "Email template is required." });
  }

  const result = await sendConciergeJourneyEmail({
    templateId,
    to: memberEmail,
    memberId,
    memberName,
    journeyId: journeyId || undefined,
    emailId: emailId || undefined,
    variables
  });

  if (result.skipped) {
    return res.status(503).json({
      ok: false,
      skipped: true,
      reason: result.reason,
      emailId: result.emailId,
      templateId: result.templateId,
      subject: result.subject,
      preview: result.preview,
      timeline: result.timeline
    });
  }

  if (!result.ok) {
    const status = result.error === "invalid_template" || result.error === "missing_member" ? 400 : 502;
    return res.status(status).json({
      ok: false,
      error: result.error || "email_send_failed",
      emailId: result.emailId,
      templateId: result.templateId,
      subject: result.subject,
      preview: result.preview,
      timeline: result.timeline
    });
  }

  return res.status(200).json({
    ok: true,
    emailId: result.emailId,
    templateId: result.templateId,
    subject: result.subject,
    preview: result.preview,
    resendId: result.resendId,
    timeline: result.timeline
  });
}

async function handlePreview(req, res, body) {
  const templateId = String(body.templateId || "").trim();
  const variables =
    body.variables && typeof body.variables === "object" ? body.variables : {};
  const preview = buildConciergeEmailPreview(templateId, variables);

  if (!preview) {
    return res.status(400).json({ ok: false, error: "Email template is required." });
  }

  return res.status(200).json({ ok: true, ...preview });
}

export default async function conciergeEmailHandler(req, res) {
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
      "concierge_email_route_error",
      {
        ...observabilityContext(req),
        action,
        error: sanitizeApiErrorForLog(error)
      },
      "error"
    );
    return res.status(500).json({ ok: false, error: "Unable to process concierge email request." });
  }
}
