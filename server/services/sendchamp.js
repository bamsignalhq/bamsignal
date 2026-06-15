import { config } from "../config.js";

export class SendchampError extends Error {
  constructor(status, message, code = "sendchamp_error") {
    super(message);
    this.name = "SendchampError";
    this.status = status;
    this.code = code;
  }
}

export function isSendchampConfigured() {
  return Boolean(
    config.sendchamp.apiKey && config.sendchamp.whatsappSender
  );
}

export function getSendchampHealthTrace() {
  return {
    hasApiKey: Boolean(config.sendchamp.apiKey),
    hasSender: Boolean(config.sendchamp.sender),
    hasWhatsappSender: Boolean(config.sendchamp.whatsappSender)
  };
}

async function sendchampFetch(path, body) {
  const apiKey = config.sendchamp.apiKey;
  if (!apiKey) {
    throw new SendchampError(503, "WhatsApp verification is not available right now.", "not_configured");
  }

  const baseUrl = config.sendchamp.baseUrl.replace(/\/$/, "");
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      "We couldn't send the code right now. Please try again.";
    throw new SendchampError(response.status, message, payload?.code || "sendchamp_request_failed");
  }

  return payload?.data ?? payload;
}

export async function sendWhatsAppVerificationOtp({ phone, sender }) {
  const whatsappSender = sender || config.sendchamp.whatsappSender;
  if (!whatsappSender) {
    throw new SendchampError(503, "WhatsApp verification is not available right now.", "missing_sender");
  }

  return sendchampFetch("/verification/create", {
    channel: "whatsapp",
    sender: whatsappSender,
    token_type: "numeric",
    token_length: 6,
    expiration_time: 10,
    customer_mobile_number: phone,
    meta_data: { source: "bamsignal_profile_verify" }
  });
}

export async function confirmWhatsAppVerificationOtp({ reference, code }) {
  return sendchampFetch("/verification/confirm", {
    verification_reference: reference,
    verification_code: String(code || "").trim()
  });
}
