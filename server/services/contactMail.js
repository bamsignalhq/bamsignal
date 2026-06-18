import dotenv from "dotenv";
import {
  buildContactAcknowledgementEmailBody,
  buildContactAcknowledgementPlainText,
  buildContactSupportEmailBody,
  buildContactSupportPlainText,
  loadEmailBranding,
  wrapEmailLayoutAsync
} from "./emailBranding.js";

dotenv.config();

export class ContactError extends Error {
  status;
  detail;

  constructor(status, message, detail) {
    super(message);
    this.name = "ContactError";
    this.status = status;
    this.detail = detail;
  }
}

async function sendEmail(payload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response;
}

function contactSuccessResult(acknowledgement) {
  return {
    ok: true,
    acknowledgement,
    message: "Support request received."
  };
}

function parseContactRequestBody(req) {
  const raw = req?.body;
  if (!raw) return {};
  if (typeof raw === "object" && !Buffer.isBuffer(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

export async function handleContactPost(body) {
  const { name, email, topic, message } = body || {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ContactError(400, "Name, email, and message are required");
  }

  if (!process.env.RESEND_API_KEY) {
    throw new ContactError(
      503,
      "We're unable to send your message right now. Please try again shortly."
    );
  }

  const branding = await loadEmailBranding();
  const safeName = name.trim();
  const safeEmail = email.trim();
  const safeTopic = topic?.trim() || "Contact message";
  const safeMessage = message.trim();
  const from = process.env.SUPPORT_EMAIL_FROM || "BamSignal <support@bamsignal.com>";
  const to = process.env.SUPPORT_EMAIL_TO || process.env.VITE_SUPPORT_EMAIL || "support@bamsignal.com";
  const supportSubject = `BamSignal support: ${safeTopic}`;

  const supportBody = buildContactSupportEmailBody({
    topic: safeTopic,
    name: safeName,
    email: safeEmail,
    message: safeMessage
  });

  const acknowledgementBody = buildContactAcknowledgementEmailBody({
    name: safeName,
    topic: safeTopic
  });

  const supportHtml = await wrapEmailLayoutAsync({
    branding,
    preheader: `New support request: ${safeTopic}`,
    bodyHtml: supportBody
  });

  const acknowledgementHtml = await wrapEmailLayoutAsync({
    branding,
    preheader: "We received your BamSignal message",
    bodyHtml: acknowledgementBody
  });

  const supportResponse = await sendEmail({
    from,
    to,
    reply_to: safeEmail,
    subject: supportSubject,
    text: buildContactSupportPlainText({
      topic: safeTopic,
      name: safeName,
      email: safeEmail,
      message: safeMessage
    }),
    html: supportHtml
  });

  if (!supportResponse.ok) {
    const detail = await supportResponse.text();
    throw new ContactError(502, "We're unable to send your message right now. Please try again shortly.", detail);
  }

  // User acknowledgement is best-effort — inbox delivery already succeeded.
  try {
    const acknowledgementResponse = await sendEmail({
      from,
      to: safeEmail,
      subject: "We received your BamSignal message",
      text: buildContactAcknowledgementPlainText({ name: safeName, topic: safeTopic }),
      html: acknowledgementHtml
    });

    if (!acknowledgementResponse.ok) {
      const detail = await acknowledgementResponse.text().catch(() => "");
      console.warn("[bamsignal] contact acknowledgement failed:", detail.slice(0, 240));
      return contactSuccessResult(false);
    }

    return contactSuccessResult(true);
  } catch (error) {
    console.warn("[bamsignal] contact acknowledgement error:", error);
    return contactSuccessResult(false);
  }
}

export function sendContactJson(res, status, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json(payload);
    return;
  }

  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function handleContactNodeRequest(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendContactJson(res, 405, { ok: false, error: "Method not allowed" });
  }

  try {
    const result = await handleContactPost(parseContactRequestBody(req));
    return sendContactJson(res, 200, result);
  } catch (error) {
    if (error instanceof ContactError) {
      return sendContactJson(res, error.status, {
        ok: false,
        error: error.message,
        detail: error.detail
      });
    }

    console.error("[bamsignal] contact form error:", error);
    return sendContactJson(res, 500, {
      ok: false,
      error: "We're unable to send your message right now. Please try again shortly."
    });
  }
}
