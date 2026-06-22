import { config } from "../config.js";
import { isSendchampConfigured } from "./sendchamp.js";
import { logObservabilityEvent, logThresholdedAlert } from "./observability.js";
import { isRetryableHttpStatus, isRetryableNetworkError, withBoundedRetry } from "./retryPolicy.js";
import { isValidNigerianPhone, toSendchampPhone } from "../utils/nigerianPhone.js";

const BAMSIGNAL_SITE = "https://bamsignal.com";
const DEFAULT_TIMEZONE = "Africa/Lagos";

export const WHATSAPP_TEMPLATE_IDS = [
  "consultation-reminder",
  "meeting-starting-soon",
  "introduction-accepted",
  "follow-up-reminder",
  "milestone-congratulations"
];

const TEMPLATE_SET = new Set(WHATSAPP_TEMPLATE_IDS);

const PROHIBITED_PATTERNS = [
  /\bmatch(?:making|maker)\b/i,
  /\brelationship\s+coach(?:ing)?\b/i,
  /\bdating\s+advice\b/i,
  /\bfind\s+(?:you|a)\s+(?:partner|match|husband|wife)\b/i,
  /\bchat\s+with\s+(?:him|her|them|your\s+match)\b/i,
  /\bwhatsapp\s+coaching\b/i
];

const TEMPLATE_ENV_KEYS = {
  "consultation-reminder": "SENDCHAMP_WHATSAPP_TEMPLATE_CONSULTATION_REMINDER",
  "meeting-starting-soon": "SENDCHAMP_WHATSAPP_TEMPLATE_MEETING_STARTING_SOON",
  "introduction-accepted": "SENDCHAMP_WHATSAPP_TEMPLATE_INTRODUCTION_ACCEPTED",
  "follow-up-reminder": "SENDCHAMP_WHATSAPP_TEMPLATE_FOLLOW_UP_REMINDER",
  "milestone-congratulations": "SENDCHAMP_WHATSAPP_TEMPLATE_MILESTONE_CONGRATULATIONS"
};

function formatLagosDateTime(value) {
  const parsed = Date.parse(String(value || ""));
  if (Number.isNaN(parsed)) return String(value || "").trim();
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: DEFAULT_TIMEZONE
  }).format(new Date(parsed));
}

function firstNameFromVars(variables = {}) {
  const direct = String(variables.firstName || "").trim();
  if (direct) return direct;
  const memberName = String(variables.memberName || "").trim();
  if (!memberName) return "Member";
  return memberName.split(/\s+/)[0] || "Member";
}

function statusUrl(variables = {}) {
  const custom = String(variables.statusUrl || "").trim();
  if (custom) return custom;
  return `${BAMSIGNAL_SITE}/signal-concierge/status`;
}

function normalizeTemplateId(value) {
  const templateId = String(value || "").trim().toLowerCase();
  return TEMPLATE_SET.has(templateId) ? templateId : null;
}

function resolveTemplateCode(templateId) {
  const envKey = TEMPLATE_ENV_KEYS[templateId];
  return envKey ? String(process.env[envKey] || "").trim() : "";
}

function containsProhibitedContent(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  return PROHIBITED_PATTERNS.some((pattern) => pattern.test(value));
}

function validateOperationalVariables(variables = {}) {
  for (const value of Object.values(variables)) {
    const text = String(value || "").trim();
    if (!text) continue;
    if (containsProhibitedContent(text)) {
      return "whatsapp_content_not_operational";
    }
    if (text.length > 240) {
      return "whatsapp_variable_too_long";
    }
  }
  return null;
}

function buildTemplatePreview(templateId, variables = {}) {
  const firstName = firstNameFromVars(variables);
  const consultantName = String(variables.consultantName || "your steward").trim();
  const scheduledLabel =
    String(variables.scheduledAtLabel || "").trim() ||
    formatLagosDateTime(variables.scheduledAt);
  const milestoneLabel = String(variables.milestoneLabel || "your milestone").trim();
  const introductionName = String(variables.introductionName || "a member").trim();

  switch (templateId) {
    case "consultation-reminder":
      return scheduledLabel
        ? `Reminder: your consultation with ${consultantName} is on ${scheduledLabel}.`
        : `Reminder: your consultation with ${consultantName} is coming up.`;
    case "meeting-starting-soon":
      return `Hi ${firstName}, your consultation begins shortly. Open BamSignal for access details.`;
    case "introduction-accepted":
      return `Hi ${firstName}, an introduction to ${introductionName} was accepted. Next steps stay in BamSignal.`;
    case "follow-up-reminder":
      return `Hi ${firstName}, steward follow-up reminder. Check your BamSignal journey status.`;
    case "milestone-congratulations":
      return `Congratulations, ${firstName} — milestone recorded: ${milestoneLabel}.`;
    default:
      return "Signal Concierge operational update.";
  }
}

function buildTemplateCustomData(templateId, variables = {}) {
  const firstName = firstNameFromVars(variables);
  const consultantName = String(variables.consultantName || "your steward").trim();
  const scheduledLabel =
    String(variables.scheduledAtLabel || "").trim() ||
    formatLagosDateTime(variables.scheduledAt);
  const milestoneLabel = String(variables.milestoneLabel || "milestone").trim();
  const introductionName = String(variables.introductionName || "a member").trim();
  const journeyUrl = statusUrl(variables);

  switch (templateId) {
    case "consultation-reminder":
      return { body: { 1: firstName, 2: consultantName, 3: scheduledLabel || "soon" } };
    case "meeting-starting-soon":
      return { body: { 1: firstName, 2: journeyUrl } };
    case "introduction-accepted":
      return { body: { 1: firstName, 2: introductionName } };
    case "follow-up-reminder":
      return { body: { 1: firstName, 2: journeyUrl } };
    case "milestone-congratulations":
      return { body: { 1: firstName, 2: milestoneLabel } };
    default:
      return { body: { 1: firstName } };
  }
}

function allocateMessageId(messageId, createdAt = new Date().toISOString()) {
  const provided = String(messageId || "").trim().toUpperCase();
  if (/^BS-WA-\d{4}-\d{4}$/.test(provided)) return provided;
  const year = new Date(createdAt).getFullYear();
  const sequence = String(Date.now()).slice(-4);
  return `BS-WA-${year}-${sequence}`;
}

function appendTimeline(timeline, status, at = new Date().toISOString(), detail) {
  const last = timeline[timeline.length - 1];
  if (last?.status === status) return timeline;
  return [...timeline, { status, at, ...(detail ? { detail } : {}) }];
}

function parseTemplateSendResponse(payload) {
  const apiStatus = String(payload?.status || "").toLowerCase();
  const apiCode = Number(payload?.code);
  const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const reference =
    data?.reference ||
    data?.message_id ||
    data?.messageId ||
    data?.id ||
    payload?.reference ||
    null;
  const deliveryStatus = String(data?.status || "sent").toLowerCase();
  const ok =
    apiStatus !== "failed" &&
    (apiCode === 200 || apiCode === 0 || !Number.isFinite(apiCode) || !payload?.code);

  return {
    ok,
    reference: reference ? String(reference) : undefined,
    deliveryStatus,
    message: payload?.message || data?.message || ""
  };
}

async function sendSendchampTemplate({ recipient, templateCode, customData, messageId, templateId }) {
  if (!isSendchampConfigured()) {
    logObservabilityEvent(
      "whatsapp_send_skipped",
      { reason: "sendchamp_not_configured", channel: "concierge_whatsapp", templateId, messageId },
      "warn"
    );
    return { ok: false, skipped: true, reason: "sendchamp_not_configured" };
  }

  const sender = config.sendchamp.whatsappSender || config.sendchamp.sender;
  if (!sender) {
    return { ok: false, skipped: true, reason: "missing_whatsapp_sender" };
  }

  const apiKey = config.sendchamp.apiKey;
  const baseUrl = config.sendchamp.baseUrl.replace(/\/$/, "");

  const response = await withBoundedRetry(
    async () => {
      const result = await fetch(`${baseUrl}/whatsapp/template/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          sender,
          recipient,
          type: "template",
          template_code: templateCode,
          custom_data: customData
        })
      });

      if (!result.ok && isRetryableHttpStatus(result.status)) {
        const error = new Error(`sendchamp_status_${result.status}`);
        error.status = result.status;
        throw error;
      }

      return result;
    },
    {
      service: "sendchamp",
      attempts: 3,
      shouldRetry: (error) => isRetryableNetworkError(error) || isRetryableHttpStatus(error?.status),
      context: { channel: "concierge_whatsapp", templateId, messageId }
    }
  );

  const payload = await response.json().catch(() => ({}));
  const parsed = parseTemplateSendResponse(payload);

  if (!response.ok || !parsed.ok) {
    const detail = parsed.message || "sendchamp_rejected";
    logThresholdedAlert("whatsapp_send_failed", {
      channel: "concierge_whatsapp",
      templateId,
      messageId,
      status: response.status,
      reason: detail
    });
    return { ok: false, error: detail };
  }

  return {
    ok: true,
    reference: parsed.reference,
    deliveryStatus: parsed.deliveryStatus
  };
}

export async function sendConciergeWhatsappNotification(input) {
  const templateId = normalizeTemplateId(input?.templateId);
  const memberId = String(input?.memberId || "").trim();
  const memberName = String(input?.memberName || "").trim();
  const rawPhone = String(input?.to || input?.memberPhone || "").trim();

  if (!templateId) {
    return { ok: false, error: "invalid_template" };
  }
  if (!memberId) {
    return { ok: false, error: "missing_member" };
  }
  if (!isValidNigerianPhone(rawPhone)) {
    return { ok: false, skipped: true, reason: "missing_recipient" };
  }

  const variables = input?.variables && typeof input.variables === "object" ? input.variables : {};
  if (variables.message || variables.body || variables.freeform) {
    return { ok: false, error: "freeform_whatsapp_not_allowed" };
  }

  const validationError = validateOperationalVariables(variables);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const templateCode = resolveTemplateCode(templateId);
  if (!templateCode) {
    const now = new Date().toISOString();
    const messageId = allocateMessageId(input?.messageId, now);
    const preview = buildTemplatePreview(templateId, variables);
    return {
      ok: false,
      skipped: true,
      reason: "template_not_configured",
      messageId,
      templateId,
      preview,
      timeline: [
        { status: "queued", at: now },
        { status: "failed", at: now, detail: "template_not_configured" }
      ]
    };
  }

  const now = new Date().toISOString();
  const messageId = allocateMessageId(input?.messageId, now);
  const preview = buildTemplatePreview(templateId, variables);
  let timeline = [{ status: "queued", at: now }];
  const recipient = toSendchampPhone(rawPhone);
  const customData = buildTemplateCustomData(templateId, {
    ...variables,
    memberName: memberName || variables.memberName,
    journeyId: input?.journeyId || variables.journeyId
  });

  const sendResult = await sendSendchampTemplate({
    recipient,
    templateCode,
    customData,
    messageId,
    templateId
  });

  if (sendResult.skipped) {
    timeline = appendTimeline(timeline, "failed", new Date().toISOString(), sendResult.reason);
    return {
      ok: false,
      skipped: true,
      reason: sendResult.reason,
      messageId,
      templateId,
      preview,
      timeline
    };
  }

  if (!sendResult.ok) {
    timeline = appendTimeline(timeline, "failed", new Date().toISOString(), sendResult.error);
    return {
      ok: false,
      error: sendResult.error || "whatsapp_send_failed",
      messageId,
      templateId,
      preview,
      timeline
    };
  }

  const sentAt = new Date().toISOString();
  timeline = appendTimeline(timeline, "sent", sentAt);
  timeline = appendTimeline(
    timeline,
    sendResult.deliveryStatus === "delivered" ? "delivered" : "delivered",
    sentAt
  );

  logObservabilityEvent("concierge_whatsapp_sent", {
    templateId,
    messageId,
    memberId,
    sendchampReference: sendResult.reference
  });

  return {
    ok: true,
    messageId,
    templateId,
    preview,
    sendchampReference: sendResult.reference,
    timeline
  };
}

export function buildConciergeWhatsappPreview(templateId, variables = {}) {
  const normalized = normalizeTemplateId(templateId);
  if (!normalized) return null;
  return {
    templateId: normalized,
    preview: buildTemplatePreview(normalized, variables)
  };
}
