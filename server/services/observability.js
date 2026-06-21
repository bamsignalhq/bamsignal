import crypto from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";
export const CORRELATION_ID_HEADER = "x-correlation-id";

const ALERTABLE_EVENTS = new Set([
  "payment_verify_failed",
  "payment_webhook_failed",
  "email_send_failed",
  "photo_upload_failed",
  "photo_storage_unavailable",
  "voice_intro_failed",
  "profile_save_failed",
  "admin_auth_failed",
  "db_unavailable",
  "throttle_db_unavailable",
  "ready_check_failed",
  "background_task_failed",
  "unhandled_request_error"
]);

const SENSITIVE_KEY_PATTERN =
  /(?:password|pin|otp|token|secret|authorization|bearer|jwt|api[_-]?key|cookie|session|signature|email|phone)/i;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const JWT_PATTERN = /^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/;
const PAYSTACK_SK_PATTERN = /sk_(?:test|live)_[a-zA-Z0-9]+/g;
const BEARER_PATTERN = /Bearer\s+[a-zA-Z0-9._~+/=-]+/gi;

export function createRequestId() {
  return crypto.randomUUID();
}

export function getRequestId(req) {
  return String(req?.observability?.requestId || req?.headers?.[REQUEST_ID_HEADER] || "").trim() || null;
}

export function getCorrelationId(req) {
  const correlationId = String(
    req?.observability?.correlationId || req?.headers?.[CORRELATION_ID_HEADER] || ""
  ).trim();
  return correlationId || getRequestId(req);
}

export function observabilityContext(req, extra = {}) {
  return {
    requestId: getRequestId(req),
    correlationId: getCorrelationId(req),
    ...extra
  };
}

/** Attach request/correlation ids for API routes and webhooks. */
export function requestContextMiddleware(req, res, next) {
  const incomingRequestId = String(req.headers[REQUEST_ID_HEADER] || "").trim();
  const incomingCorrelationId = String(req.headers[CORRELATION_ID_HEADER] || "").trim();
  const requestId = incomingRequestId || createRequestId();
  const correlationId = incomingCorrelationId || requestId;

  req.observability = { requestId, correlationId };
  res.setHeader(REQUEST_ID_HEADER, requestId);
  if (correlationId !== requestId) {
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
  }
  next();
}

function redactString(value) {
  if (typeof value !== "string") return value;
  let out = value.replace(PAYSTACK_SK_PATTERN, "[redacted_paystack_secret]");
  out = out.replace(BEARER_PATTERN, "Bearer [redacted]");
  out = out.replace(EMAIL_PATTERN, "[redacted_email]");
  if (JWT_PATTERN.test(out.trim())) return "[redacted_jwt]";
  return out;
}

export function sanitizeLogContext(context = {}) {
  const safe = {};
  for (const [key, value] of Object.entries(context)) {
    if (value === undefined) continue;
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      safe[key] = "[redacted]";
      continue;
    }
    if (value instanceof Error) {
      safe.error = redactString(value.message || "error");
      if (value.code) safe.code = value.code;
      continue;
    }
    if (typeof value === "string") {
      safe[key] = redactString(value);
      continue;
    }
    if (Array.isArray(value)) {
      safe[key] = value.map((item) =>
        typeof item === "string" ? redactString(item) : item && typeof item === "object" ? sanitizeLogContext(item) : item
      );
      continue;
    }
    if (value && typeof value === "object") {
      safe[key] = sanitizeLogContext(value);
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

export function logObservabilityEvent(event, context = {}, level = "info") {
  const payload = sanitizeLogContext({
    event,
    at: new Date().toISOString(),
    ...context
  });
  const label = `[bamsignal] ${event}`;
  if (level === "error" || ALERTABLE_EVENTS.has(event)) {
    console.error(label, payload);
    return payload;
  }
  if (level === "warn") {
    console.warn(label, payload);
    return payload;
  }
  console.info(label, payload);
  return payload;
}

export function logAlertableEvent(event, context = {}) {
  return logObservabilityEvent(event, context, "error");
}

export function logBackgroundTaskFailure(taskName, error, context = {}) {
  return logAlertableEvent("background_task_failed", {
    task: taskName,
    error: error instanceof Error ? error.message : String(error || "unknown"),
    code: error?.code || null,
    ...context
  });
}

let lastReadyFailureLogAt = 0;
const READY_FAILURE_LOG_INTERVAL_MS = 5 * 60 * 1000;

/** Rate-limited alert when readiness checks fail. */
export function logReadyCheckFailed(context = {}) {
  const now = Date.now();
  if (now - lastReadyFailureLogAt < READY_FAILURE_LOG_INTERVAL_MS) return null;
  lastReadyFailureLogAt = now;
  return logAlertableEvent("ready_check_failed", context);
}
