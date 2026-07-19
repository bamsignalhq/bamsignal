import { SendchampError } from "./sendchamp.js";
import { safeClientMessage } from "./errorResponse.js";

export const VERIFICATION_ERROR_CODES = {
  INVALID_PHONE: "invalid_phone",
  RATE_LIMITED: "rate_limited",
  PROVIDER_UNAVAILABLE: "provider_unavailable",
  PROVIDER_TIMEOUT: "provider_timeout",
  PROVIDER_REJECTED: "provider_rejected",
  SENDER_CONFIG: "sender_config",
  NOT_CONFIGURED: "not_configured",
  NETWORK_ERROR: "network_error",
  DELIVERY_FAILED: "delivery_failed",
  NO_ACTIVE_SESSION: "no_active_session",
  CODE_EXPIRED: "code_expired",
  TOO_MANY_ATTEMPTS: "too_many_attempts",
  INVALID_CODE: "invalid_code",
  UNEXPECTED: "unexpected_error"
};

export class SmsVerificationError extends Error {
  constructor(status, message, code = VERIFICATION_ERROR_CODES.UNEXPECTED) {
    super(message);
    this.name = "SmsVerificationError";
    this.status = status;
    this.code = code;
  }
}

/** @deprecated Use SmsVerificationError */
export class WhatsappVerificationError extends SmsVerificationError {
  constructor(status, message, code) {
    super(status, message, code);
    this.name = "WhatsappVerificationError";
  }
}

function providerMessage(error) {
  const raw = String(error?.message || "").trim();
  return safeClientMessage(raw, "");
}

export function mapSendchampStartError(error) {
  if (!(error instanceof SendchampError)) {
    return new SmsVerificationError(
      500,
      "Unexpected server error.",
      VERIFICATION_ERROR_CODES.UNEXPECTED
    );
  }

  const providerCode = String(error.code || "");
  const status = Number(error.status) || 502;
  const detail = providerMessage(error).toLowerCase();

  if (providerCode === "not_configured") {
    return new SmsVerificationError(
      503,
      "Verification temporarily unavailable.",
      VERIFICATION_ERROR_CODES.NOT_CONFIGURED
    );
  }

  if (providerCode === "missing_sender") {
    return new SmsVerificationError(
      503,
      "Sender configuration issue.",
      VERIFICATION_ERROR_CODES.SENDER_CONFIG
    );
  }

  if (providerCode === "provider_timeout" || providerCode === "network_error") {
    return new SmsVerificationError(
      504,
      "Network timeout. Try again.",
      providerCode === "provider_timeout"
        ? VERIFICATION_ERROR_CODES.PROVIDER_TIMEOUT
        : VERIFICATION_ERROR_CODES.NETWORK_ERROR
    );
  }

  if (status === 429) {
    return new SmsVerificationError(
      429,
      "Too many attempts.",
      VERIFICATION_ERROR_CODES.RATE_LIMITED
    );
  }

  if (status === 400 && /phone|mobile|number|invalid/i.test(detail)) {
    return new SmsVerificationError(
      400,
      "Invalid phone number.",
      VERIFICATION_ERROR_CODES.INVALID_PHONE
    );
  }

  if (status === 400 && /sender|template|meta_data|sms/i.test(detail)) {
    return new SmsVerificationError(
      502,
      "Sender configuration issue.",
      VERIFICATION_ERROR_CODES.SENDER_CONFIG
    );
  }

  if (status >= 500 || status === 502 || status === 503 || status === 504) {
    return new SmsVerificationError(
      502,
      "Unable to send SMS right now.",
      VERIFICATION_ERROR_CODES.PROVIDER_UNAVAILABLE
    );
  }

  if (providerMessage(error)) {
    return new SmsVerificationError(
      502,
      "Provider rejected request.",
      VERIFICATION_ERROR_CODES.PROVIDER_REJECTED
    );
  }

  return new SmsVerificationError(
    502,
    "Unable to send SMS right now.",
    VERIFICATION_ERROR_CODES.PROVIDER_UNAVAILABLE
  );
}

export function mapSendchampConfirmError(error) {
  if (!(error instanceof SendchampError)) {
    return new SmsVerificationError(
      500,
      "Unexpected server error.",
      VERIFICATION_ERROR_CODES.UNEXPECTED
    );
  }

  const status = Number(error.status) || 502;
  const detail = providerMessage(error).toLowerCase();

  if (status === 429) {
    return new SmsVerificationError(
      429,
      "Too many attempts. Request a new code.",
      VERIFICATION_ERROR_CODES.TOO_MANY_ATTEMPTS
    );
  }

  if (status === 400 || /invalid|incorrect|wrong|mismatch|expired/i.test(detail)) {
    return new SmsVerificationError(
      400,
      "We couldn't verify that code. Check it and try again.",
      VERIFICATION_ERROR_CODES.INVALID_CODE
    );
  }

  if (status >= 500) {
    return new SmsVerificationError(
      502,
      "Unable to verify that code right now.",
      VERIFICATION_ERROR_CODES.PROVIDER_UNAVAILABLE
    );
  }

  return new SmsVerificationError(
    400,
    "We couldn't verify that code. Check it and try again.",
    VERIFICATION_ERROR_CODES.INVALID_CODE
  );
}
