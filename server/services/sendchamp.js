import {
  PAYSTACK_HTTP_TIMEOUT_MS,
  SENDCHAMP_HTTP_TIMEOUT_MS,
  SENDCHAMP_MAX_NETWORK_ATTEMPTS,
  SENDCHAMP_RETRY_DELAY_MS,
  WHATSAPP_OTP_EXPIRATION_MINUTES
} from "../../shared/operationalConstants.mjs";
import { config } from "../config.js";
import { logWhatsappVerification } from "./verificationLog.js";

const OTP_EXPIRATION_MINUTES = WHATSAPP_OTP_EXPIRATION_MINUTES;
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
  const { apiKey, sender, whatsappSender } = config.sendchamp;
  return Boolean(apiKey && (whatsappSender || sender));
}

export function getSendchampHealthTrace() {
  return {
    hasApiKey: Boolean(config.sendchamp.apiKey),
    hasSender: Boolean(config.sendchamp.sender),
    hasWhatsappSender: Boolean(config.sendchamp.whatsappSender),
    baseUrl: config.sendchamp.baseUrl
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

function extractReference(payload) {
  const data = payload?.data && typeof payload.data === "object" ? payload.data : null;
  const candidates = [
    data?.verification_reference,
    data?.reference,
    payload?.verification_reference,
    payload?.reference
  ];

  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (value) return value;
  }

  return null;
}

function extractProviderMessage(payload) {
  return (
    payload?.message ||
    payload?.error ||
    payload?.data?.message ||
    payload?.errors?.[0]?.message ||
    ""
  );
}

export function parseSendchampEnvelope(payload, { requireReference = true } = {}) {
  const apiStatus = String(payload?.status || "").toLowerCase();
  const apiCode = Number(payload?.code);
  const reference = extractReference(payload);
  const data = payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const deliveryStatus = String(data?.status || payload?.delivery_status || "sent").toLowerCase();
  const failed = apiStatus === "failed" || apiStatus === "error";
  const successCode = apiCode === 200 || apiCode === 201 || apiCode === 0;
  const ok =
    !failed &&
    (successCode || !Number.isFinite(apiCode) || Boolean(reference)) &&
    (!requireReference || Boolean(reference));

  return {
    ok,
    reference,
    deliveryStatus,
    message: extractProviderMessage(payload)
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableNetworkError(error) {
  if (!error) return false;
  if (error.name === "AbortError") return true;
  if (error instanceof TypeError) return true;
  return false;
}

async function fetchWithTimeout(url, options, timeoutMs = SENDCHAMP_HTTP_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function sendchampFetch(path, body, { requireReference = true, logContext = {} } = {}) {
  const apiKey = config.sendchamp.apiKey;
  if (!apiKey) {
    throw new SendchampError(503, "Verification temporarily unavailable.", "not_configured");
  }

  const baseUrl = config.sendchamp.baseUrl.replace(/\/$/, "");
  const url = `${baseUrl}${path}`;
  const started = Date.now();

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  };

  let response;
  let retried = false;

  for (let attempt = 0; attempt < SENDCHAMP_MAX_NETWORK_ATTEMPTS; attempt += 1) {
    try {
      response = await fetchWithTimeout(url, requestOptions);
      break;
    } catch (error) {
      if (attempt === 0 && isRetryableNetworkError(error)) {
        retried = true;
        logWhatsappVerification(
          "provider_retry",
          {
            ...logContext,
            provider: "sendchamp",
            path,
            attempt: attempt + 1,
            reason: error.name || "network_error"
          },
          "warn"
        );
        await sleep(SENDCHAMP_RETRY_DELAY_MS);
        continue;
      }

      logWhatsappVerification(
        "provider_failed",
        {
          ...logContext,
          provider: "sendchamp",
          path,
          durationMs: Date.now() - started,
          providerStatus: "network_error",
          failureReason: error.name || "network_error",
          retried
        },
        "error"
      );

      throw new SendchampError(
        504,
        "Network timeout. Try again.",
        error.name === "AbortError" ? "provider_timeout" : "network_error"
      );
    }
  }

  const payload = await response.json().catch(() => ({}));
  const parsed = parseSendchampEnvelope(payload, { requireReference });

  logWhatsappVerification(
    parsed.ok ? "provider_success" : "provider_failed",
    {
      ...logContext,
      provider: "sendchamp",
      path,
      durationMs: Date.now() - started,
      providerStatus: parsed.deliveryStatus || String(response.status),
      failureReason: parsed.ok ? null : parsed.message || "provider_rejected",
      deliveryRequested: path.includes("create"),
      deliveryConfirmed: parsed.ok,
      otpGenerated: path.includes("create") && parsed.ok,
      retried
    },
    parsed.ok ? "info" : "error"
  );

  if (!response.ok || !parsed.ok) {
    const message =
      parsed.message ||
      (requireReference
        ? "Unable to contact WhatsApp service."
        : "We couldn't verify that code. Check it and try again.");
    throw new SendchampError(response.status || 502, message, payload?.code || "sendchamp_request_failed");
  }

  return {
    reference: parsed.reference,
    status: parsed.deliveryStatus || "sent"
  };
}

export async function sendWhatsAppVerificationOtp({ phone, sender, logContext = {} }) {
  const whatsappSender = resolveWhatsappSender(sender);
  if (!whatsappSender) {
    throw new SendchampError(503, "Sender configuration issue.", "missing_sender");
  }

  const body = buildVerificationCreateBody({ phone, sender: whatsappSender, includeCustomMessage: true });

  try {
    return await sendchampFetch("/verification/create", body, { logContext });
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
      return sendchampFetch("/verification/create", fallbackBody, { logContext });
    }

    throw error;
  }
}

export async function confirmWhatsAppVerificationOtp({ reference, code, logContext = {} }) {
  return sendchampFetch(
    "/verification/confirm",
    {
      verification_reference: reference,
      verification_code: String(code || "").trim()
    },
    { requireReference: false, logContext }
  );
}
