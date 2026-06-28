import {
  SENDCHAMP_HTTP_TIMEOUT_MS,
  RETRY_DEFAULT_ATTEMPTS,
  WHATSAPP_OTP_EXPIRATION_MINUTES
} from "../../shared/operationalConstants.mjs";
import { config } from "../config.js";
import { logWhatsappVerification } from "./verificationLog.js";
import { isRetryableHttpStatus, isRetryableNetworkError, withBoundedRetry } from "./retryPolicy.js";

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

async function sendchampFetch(path, body, { requireReference = true, logContext = {} } = {}) {
  const apiKey = config.sendchamp.apiKey;
  if (!apiKey) {
    throw new SendchampError(503, "Verification temporarily unavailable.", "not_configured");
  }

  const baseUrl = config.sendchamp.baseUrl.replace(/\/$/, "");
  const url = `${baseUrl}${path}`;
  const started = Date.now();
  let retried = false;

  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(body)
  };

  const { response, payload } = await withBoundedRetry(
    async (attempt) => {
      if (attempt > 1) {
        retried = true;
        logWhatsappVerification(
          "provider_retry",
          {
            ...logContext,
            provider: "sendchamp",
            path,
            attempt,
            reason: "retryable_error"
          },
          "warn"
        );
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), SENDCHAMP_HTTP_TIMEOUT_MS);
      try {
        const httpResponse = await fetch(url, { ...requestOptions, signal: controller.signal });
        const json = await httpResponse.json().catch(() => ({}));

        if (!httpResponse.ok && isRetryableHttpStatus(httpResponse.status)) {
          const retryError = new SendchampError(httpResponse.status, "Sendchamp temporary error.", "retryable_http");
          retryError.retryable = true;
          throw retryError;
        }

        return { response: httpResponse, payload: json };
      } catch (error) {
        if (error instanceof SendchampError && error.code === "retryable_http") {
          throw error;
        }
        if (error?.name === "AbortError") {
          throw new SendchampError(504, "Network timeout. Try again.", "provider_timeout");
        }
        if (isRetryableNetworkError(error)) {
          throw error;
        }
        throw new SendchampError(504, "Network timeout. Try again.", "network_error");
      } finally {
        clearTimeout(timer);
      }
    },
    {
      service: "sendchamp",
      attempts: RETRY_DEFAULT_ATTEMPTS,
      shouldRetry: (error) => {
        if (error instanceof SendchampError && error.code === "retryable_http") {
          return isRetryableHttpStatus(error.status);
        }
        return isRetryableNetworkError(error);
      },
      context: { path }
    }
  ).catch((error) => {
    logWhatsappVerification(
      "provider_failed",
      {
        ...logContext,
        provider: "sendchamp",
        path,
        durationMs: Date.now() - started,
        providerStatus: "network_error",
        failureReason: error instanceof SendchampError ? error.code : error?.name || "network_error",
        retried
      },
      "error"
    );
    throw error instanceof SendchampError
      ? error
      : new SendchampError(504, "Network timeout. Try again.", "network_error");
  });

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
