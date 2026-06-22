import {
  BAMSIGNAL_SITE,
  buildPlainEmailFooter,
  emailButton,
  emailFieldCards,
  emailHeading,
  emailKicker,
  emailLead,
  emailMuted,
  escapeHtml,
  loadEmailBranding,
  wrapEmailLayoutAsync
} from "./emailBranding.js";
import { logObservabilityEvent, logThresholdedAlert } from "./observability.js";
import { isRetryableHttpStatus, isRetryableNetworkError, withBoundedRetry } from "./retryPolicy.js";

const SUPPORT_EMAIL = "support@bamsignal.com";
const DEFAULT_TIMEZONE = "Africa/Lagos";

export const CONCIERGE_EMAIL_TEMPLATE_IDS = [
  "application-received",
  "consultation-scheduled",
  "consultation-reminder",
  "application-approved",
  "introduction-presented",
  "relationship-milestone",
  "archive-congratulations"
];

const TEMPLATE_SET = new Set(CONCIERGE_EMAIL_TEMPLATE_IDS);

const TEMPLATE_COPY = {
  "application-received": {
    subject: "Your Signal Concierge application",
    preview: "We received your application privately. A steward will review with care.",
    kicker: "Application received"
  },
  "consultation-scheduled": {
    subject: "Your consultation is scheduled",
    preview: "Your private consultation is confirmed. Details are shared only with you.",
    kicker: "Consultation scheduled"
  },
  "consultation-reminder": {
    subject: "Reminder: your Signal Concierge consultation",
    preview: "A gentle reminder about your upcoming private consultation.",
    kicker: "Consultation reminder"
  },
  "application-approved": {
    subject: "Welcome to your private journey",
    preview: "Your application was approved. Your steward will guide next steps.",
    kicker: "Application approved"
  },
  "introduction-presented": {
    subject: "A confidential introduction",
    preview: "A confidential introduction was presented for your consideration.",
    kicker: "Introduction presented"
  },
  "relationship-milestone": {
    subject: "A milestone on your journey",
    preview: "A relationship milestone was recorded in your permanent journey archive.",
    kicker: "Milestone recorded"
  },
  "archive-congratulations": {
    subject: "Congratulations on your journey",
    preview: "Your journey was archived with dignity. The record is permanent.",
    kicker: "Journey archived"
  }
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
  if (!memberName) return "there";
  return memberName.split(/\s+/)[0] || "there";
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

function buildTemplateSubject(templateId, variables = {}) {
  return TEMPLATE_COPY[templateId]?.subject ?? "Signal Concierge update";
}

function buildTemplatePreview(templateId, variables = {}) {
  const base = TEMPLATE_COPY[templateId]?.preview ?? "";
  const firstName = firstNameFromVars(variables);
  if (templateId === "consultation-scheduled" && variables.consultantName) {
    return `Your consultation with ${variables.consultantName} is confirmed.`;
  }
  if (templateId === "introduction-presented" && variables.introductionName) {
    return `A confidential introduction to ${variables.introductionName} was presented.`;
  }
  if (templateId === "relationship-milestone" && variables.milestoneLabel) {
    return `Milestone recorded: ${variables.milestoneLabel}.`;
  }
  return base.replace("there", firstName);
}

function buildTemplateBodyHtml(templateId, variables = {}) {
  const copy = TEMPLATE_COPY[templateId];
  const firstName = firstNameFromVars(variables);
  const journeyUrl = statusUrl(variables);
  const cards = [];

  if (variables.journeyId) {
    cards.push({ label: "Journey ID", value: variables.journeyId });
  }

  if (templateId === "application-received") {
    return `
      ${emailKicker(copy.kicker)}
      ${emailHeading(`Thank you, ${escapeHtml(firstName)}.`)}
      ${emailLead("We received your Signal Concierge application privately.")}
      ${cards.length ? emailFieldCards(cards) : ""}
      ${emailLead("A steward will review with care and reach out when it is time for your consultation.")}
      ${emailMuted("Your application is never listed publicly.")}
      ${emailButton("View application status", journeyUrl)}
    `;
  }

  if (templateId === "consultation-scheduled" || templateId === "consultation-reminder") {
    const consultantName = String(variables.consultantName || "your steward").trim();
    const scheduledLabel =
      String(variables.scheduledAtLabel || "").trim() ||
      formatLagosDateTime(variables.scheduledAt);
    if (scheduledLabel) cards.push({ label: "Scheduled", value: scheduledLabel });
    if (variables.consultantName) cards.push({ label: "Steward", value: consultantName });
    if (variables.meetingChannel) cards.push({ label: "Channel", value: variables.meetingChannel });
    if (variables.meetingLink) cards.push({ label: "Access", value: variables.meetingLink });

    const lead =
      templateId === "consultation-reminder"
        ? `This is a gentle reminder about your private consultation with ${escapeHtml(consultantName)}.`
        : `Your private consultation with ${escapeHtml(consultantName)} is confirmed.`;

    return `
      ${emailKicker(copy.kicker)}
      ${emailHeading(`Hi ${escapeHtml(firstName)},`)}
      ${emailLead(lead)}
      ${cards.length ? emailFieldCards(cards) : ""}
      ${emailMuted("Calendar details are shared only with you — never posted publicly.")}
      ${emailButton("View consultation details", journeyUrl)}
    `;
  }

  if (templateId === "application-approved") {
    return `
      ${emailKicker(copy.kicker)}
      ${emailHeading(`Welcome, ${escapeHtml(firstName)}.`)}
      ${emailLead("Your Signal Concierge application was approved.")}
      ${cards.length ? emailFieldCards(cards) : ""}
      ${emailLead("Your steward will guide next steps privately — introductions only happen with mutual consent.")}
      ${emailButton("Open your journey", journeyUrl)}
    `;
  }

  if (templateId === "introduction-presented") {
    const introductionName = String(variables.introductionName || "a member").trim();
    cards.push({ label: "Introduction", value: introductionName });
    return `
      ${emailKicker(copy.kicker)}
      ${emailHeading(`Hi ${escapeHtml(firstName)},`)}
      ${emailLead(`A confidential introduction to ${escapeHtml(introductionName)} was presented for your consideration.`)}
      ${emailFieldCards(cards)}
      ${emailMuted("Both parties choose privately before any connection.")}
      ${emailButton("Review introduction", journeyUrl)}
    `;
  }

  if (templateId === "relationship-milestone") {
    const milestoneLabel = String(variables.milestoneLabel || "Milestone").trim();
    cards.push({ label: "Milestone", value: milestoneLabel });
    return `
      ${emailKicker(copy.kicker)}
      ${emailHeading(`Congratulations, ${escapeHtml(firstName)}.`)}
      ${emailLead(`A relationship milestone was recorded in your permanent journey archive: ${escapeHtml(milestoneLabel)}.`)}
      ${emailFieldCards(cards)}
      ${emailMuted("Milestones are celebrated privately within BamSignal.")}
      ${emailButton("View journey archive", journeyUrl)}
    `;
  }

  if (templateId === "archive-congratulations") {
    const archiveNote =
      String(variables.archiveNote || "").trim() ||
      "Your journey was archived with dignity. The record is permanent.";
    return `
      ${emailKicker(copy.kicker)}
      ${emailHeading(`Congratulations, ${escapeHtml(firstName)}.`)}
      ${emailLead(escapeHtml(archiveNote))}
      ${cards.length ? emailFieldCards(cards) : ""}
      ${emailMuted("Archives honor the journey — never deleted, never public.")}
      ${emailButton("View journey archive", journeyUrl)}
    `;
  }

  return `
    ${emailKicker("Signal Concierge")}
    ${emailHeading(`Hi ${escapeHtml(firstName)},`)}
    ${emailLead(copy?.preview ?? "A private update on your Signal Concierge journey.")}
    ${emailButton("Open BamSignal", journeyUrl)}
  `;
}

function buildTemplatePlainText(templateId, variables = {}) {
  const firstName = firstNameFromVars(variables);
  const preview = buildTemplatePreview(templateId, variables);
  const journeyUrl = statusUrl(variables);
  const lines = [`Hi ${firstName},`, "", preview, ""];

  if (variables.journeyId) lines.push(`Journey ID: ${variables.journeyId}`, "");
  if (variables.consultantName && templateId.includes("consultation")) {
    lines.push(`Steward: ${variables.consultantName}`);
  }
  if (variables.scheduledAt) {
    lines.push(
      `Scheduled: ${String(variables.scheduledAtLabel || "").trim() || formatLagosDateTime(variables.scheduledAt)}`
    );
  }
  if (variables.meetingLink) lines.push(`Access: ${variables.meetingLink}`);
  if (variables.introductionName) lines.push(`Introduction: ${variables.introductionName}`);
  if (variables.milestoneLabel) lines.push(`Milestone: ${variables.milestoneLabel}`);
  if (variables.archiveNote) lines.push(variables.archiveNote);

  lines.push("", `View your journey: ${journeyUrl}`, "", `If you need help, contact ${SUPPORT_EMAIL}.`, "", "Thank you,", "BamSignal Signal Concierge", buildPlainEmailFooter());
  return lines.join("\n");
}

function allocateEmailId(emailId, createdAt = new Date().toISOString()) {
  const provided = String(emailId || "").trim().toUpperCase();
  if (/^BS-EML-\d{4}-\d{4}$/.test(provided)) return provided;
  const year = new Date(createdAt).getFullYear();
  const sequence = String(Date.now()).slice(-4);
  return `BS-EML-${year}-${sequence}`;
}

function appendTimeline(timeline, status, at = new Date().toISOString(), detail) {
  const last = timeline[timeline.length - 1];
  if (last?.status === status) return timeline;
  return [...timeline, { status, at, ...(detail ? { detail } : {}) }];
}

async function sendResendEmail({ to, subject, html, text, emailId, templateId }) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    logObservabilityEvent(
      "email_send_skipped",
      { reason: "resend_not_configured", channel: "concierge_journey", templateId, emailId },
      "warn"
    );
    return { ok: false, skipped: true, reason: "resend_not_configured" };
  }

  const from =
    process.env.CONCIERGE_EMAIL_FROM?.trim() ||
    process.env.SUPPORT_EMAIL_FROM?.trim() ||
    process.env.SIGNUP_EMAIL_FROM?.trim() ||
    "BamSignal Signal Concierge <support@bamsignal.com>";

  const response = await withBoundedRetry(
    async () => {
      const result = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text,
          tags: [
            { name: "channel", value: "concierge_journey" },
            { name: "template", value: templateId },
            { name: "email_id", value: emailId }
          ]
        })
      });

      if (!result.ok && isRetryableHttpStatus(result.status)) {
        const error = new Error(`resend_status_${result.status}`);
        error.status = result.status;
        throw error;
      }

      return result;
    },
    {
      service: "resend",
      attempts: 3,
      shouldRetry: (error) => isRetryableNetworkError(error) || isRetryableHttpStatus(error?.status),
      context: { channel: "concierge_journey", templateId, emailId }
    }
  );

  if (!response.ok) {
    let detail = "resend_rejected";
    try {
      const payload = await response.json();
      detail = String(payload?.message || payload?.error || detail);
    } catch {
      // ignore parse errors
    }
    logThresholdedAlert("email_send_failed", {
      channel: "concierge_journey",
      templateId,
      emailId,
      status: response.status,
      reason: detail
    });
    return { ok: false, error: detail };
  }

  let resendId;
  try {
    const payload = await response.json();
    resendId = String(payload?.id || "").trim() || undefined;
  } catch {
    // ignore parse errors
  }

  return { ok: true, resendId };
}

export async function sendConciergeJourneyEmail(input) {
  const templateId = normalizeTemplateId(input?.templateId);
  const to = String(input?.to || "")
    .trim()
    .toLowerCase();
  const memberId = String(input?.memberId || "").trim();
  const memberName = String(input?.memberName || "").trim();

  if (!templateId) {
    return { ok: false, error: "invalid_template" };
  }
  if (!to.includes("@")) {
    return { ok: false, skipped: true, reason: "missing_recipient" };
  }
  if (!memberId) {
    return { ok: false, error: "missing_member" };
  }

  const variables = input?.variables && typeof input.variables === "object" ? input.variables : {};
  const now = new Date().toISOString();
  const emailId = allocateEmailId(input?.emailId, now);
  const subject = buildTemplateSubject(templateId, variables);
  const preview = buildTemplatePreview(templateId, variables);
  let timeline = [{ status: "queued", at: now }];

  const branding = await loadEmailBranding();
  const bodyHtml = buildTemplateBodyHtml(templateId, {
    ...variables,
    memberName: memberName || variables.memberName,
    journeyId: input?.journeyId || variables.journeyId
  });
  const html = await wrapEmailLayoutAsync({
    bodyHtml,
    branding,
    preheader: preview
  });
  const text = buildTemplatePlainText(templateId, {
    ...variables,
    memberName: memberName || variables.memberName,
    journeyId: input?.journeyId || variables.journeyId
  });

  const sendResult = await sendResendEmail({ to, subject, html, text, emailId, templateId });

  if (sendResult.skipped) {
    timeline = appendTimeline(timeline, "failed", new Date().toISOString(), sendResult.reason);
    return {
      ok: false,
      skipped: true,
      reason: sendResult.reason,
      emailId,
      templateId,
      subject,
      preview,
      timeline
    };
  }

  if (!sendResult.ok) {
    timeline = appendTimeline(timeline, "failed", new Date().toISOString(), sendResult.error);
    return {
      ok: false,
      error: sendResult.error || "email_send_failed",
      emailId,
      templateId,
      subject,
      preview,
      timeline
    };
  }

  const sentAt = new Date().toISOString();
  timeline = appendTimeline(timeline, "sent", sentAt);
  timeline = appendTimeline(timeline, "delivered", sentAt);

  logObservabilityEvent("concierge_email_sent", {
    templateId,
    emailId,
    memberId,
    resendId: sendResult.resendId
  });

  return {
    ok: true,
    emailId,
    templateId,
    subject,
    preview,
    resendId: sendResult.resendId,
    timeline
  };
}

export function buildConciergeEmailPreview(templateId, variables = {}) {
  const normalized = normalizeTemplateId(templateId);
  if (!normalized) return null;
  return {
    templateId: normalized,
    subject: buildTemplateSubject(normalized, variables),
    preview: buildTemplatePreview(normalized, variables)
  };
}
