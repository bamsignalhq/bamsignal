import { config } from "../config.js";

const OTP_EXPIRATION_MINUTES = 30;
const BAM_SIGNAL_OTP_MESSAGE =
  "Your BamSignal Code is {{code}}. DO NOT share it with anyone. It is valid for 30 minutes.";

let loggedCustomMessageNote = false;

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
    config.sendchamp.apiKey && config.sendchamp.sender && config.sendchamp.whatsappSender
  );
}

export function getSendchampHealthTrace() {
  return {
    hasApiKey: Boolean(config.sendchamp.apiKey),
    hasSender: Boolean(config.sendchamp.sender),
    hasWhatsappSender: Boolean(config.sendchamp.whatsappSender)
  };
}

function resolveWhatsappSender(override) {
  return override || config.sendchamp.whatsappSender || config.sendchamp.sender;
}

function buildVerificationCreateBody({ phone, sender, includeCustomMessage = true }) {
  const meta_data = {
    description: "BamSignal phone verification",
    brand: "BamSignal"
  };
  if (includeCustomMessage) {
    meta_data.message = BAM_SIGNAL_OTP_MESSAGE;
  }

  return {
    channel: "whatsapp",
    sender,
    token_type: "numeric",
    token_length: 6,
    expiration_time: OTP_EXPIRATION_MINUTES,
    customer_mobile_number: phone,
    customer_email_address: "",
    meta_data,
    in_app_token: false
  };
}

function parseSendchampEnvelope(payload) {
  const apiStatus = String(payload?.status || "").toLowerCase();
  const apiCode = Number(payload?.code);
  const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const reference = data?.reference || data?.verification_reference || null;
  const deliveryStatus = String(data?.status || "sent").toLowerCase();
  const ok =
    apiStatus !== "failed" &&
    (apiCode === 200 || apiCode === 0 || !Number.isFinite(apiCode) || !payload?.code);

  return { ok, reference, deliveryStatus, message: payload?.message || "" };
}

async function sendchampFetch(path, body, { requireReference = true } = {}) {
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
  const parsed = parseSendchampEnvelope(payload);
  const referenceOk = !requireReference || Boolean(parsed.reference);

  if (!response.ok || !parsed.ok || !referenceOk) {
    const message =
      parsed.message ||
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      (requireReference
        ? "We couldn't send the code right now. Please try again."
        : "We couldn't verify that code. Check it and try again.");
    throw new SendchampError(response.status || 502, message, payload?.code || "sendchamp_request_failed");
  }

  return {
    reference: parsed.reference,
    status: parsed.deliveryStatus || "sent"
  };
}

export async function sendWhatsAppVerificationOtp({ phone, sender }) {
  const whatsappSender = resolveWhatsappSender(sender);
  if (!whatsappSender) {
    throw new SendchampError(503, "WhatsApp verification is not available right now.", "missing_sender");
  }

  const body = buildVerificationCreateBody({ phone, sender: whatsappSender, includeCustomMessage: true });

  try {
    return await sendchampFetch("/verification/create", body);
  } catch (error) {
    const message = error instanceof SendchampError ? error.message : "";
    const customMessageRejected =
      /message|meta_data|template|invalid/i.test(message) && body.meta_data?.message;

    if (customMessageRejected) {
      if (!loggedCustomMessageNote) {
        console.info(
          "[bamsignal] Sendchamp may not support custom OTP message on verification/create; retrying with brand/description only."
        );
        loggedCustomMessageNote = true;
      }
      const fallbackBody = buildVerificationCreateBody({
        phone,
        sender: whatsappSender,
        includeCustomMessage: false
      });
      return sendchampFetch("/verification/create", fallbackBody);
    }

    throw error;
  }
}

export async function confirmWhatsAppVerificationOtp({ reference, code }) {
  return sendchampFetch(
    "/verification/confirm",
    {
      verification_reference: reference,
      verification_code: String(code || "").trim()
    },
    { requireReference: false }
  );
}
