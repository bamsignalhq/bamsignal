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
  "retry_exhausted",
  "unhandled_request_error"
]);

/** Minimum interval between repeated alert logs for the same event key. */
const ALERT_THRESHOLDS_MS = {
  payment_verify_failed: 2 * 60 * 1000,
  payment_webhook_failed: 2 * 60 * 1000,
  email_send_failed: 5 * 60 * 1000,
  photo_upload_failed: 3 * 60 * 1000,
  photo_storage_unavailable: 5 * 60 * 1000,
  voice_intro_failed: 3 * 60 * 1000,
  profile_save_failed: 3 * 60 * 1000,
  db_unavailable: 5 * 60 * 1000,
  throttle_db_unavailable: 5 * 60 * 1000,
  ready_check_failed: 5 * 60 * 1000,
  background_task_failed: 3 * 60 * 1000,
  retry_exhausted: 5 * 60 * 1000,
  unhandled_request_error: 2 * 60 * 1000
};

const alertLastEmittedAt = new Map();

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

function alertDedupeKey(event, context = {}) {
  return [
    event,
    context.scope,
    context.task,
    context.service,
    context.channel,
    context.action,
    context.reason,
    context.reference
  ]
    .filter(Boolean)
    .join(":");
}

/** Emit alertable events at most once per threshold window per dedupe key. */
export function logThresholdedAlert(event, context = {}) {
  const thresholdMs = ALERT_THRESHOLDS_MS[event] ?? 3 * 60 * 1000;
  const key = alertDedupeKey(event, context);
  const now = Date.now();
  const last = alertLastEmittedAt.get(key) || 0;
  if (now - last < thresholdMs) return null;
  alertLastEmittedAt.set(key, now);
  return logAlertableEvent(event, context);
}

export function logRetryExhausted(service, context = {}) {
  return logThresholdedAlert("retry_exhausted", { service, ...context });
}

export function logTimerCleanup(name, context = {}) {
  return logObservabilityEvent("timer_cleanup", { name, ...context }, "info");
}

export function logListenerCleanup(name, context = {}) {
  return logObservabilityEvent("listener_cleanup", { name, ...context }, "info");
}

export function logWebsocketClosed(context = {}) {
  return logObservabilityEvent("websocket_closed", context, "info");
}

export function logBackgroundTaskFailure(taskName, error, context = {}) {
  return logThresholdedAlert("background_task_failed", {
    task: taskName,
    error: error instanceof Error ? error.message : String(error || "unknown"),
    code: error?.code || null,
    ...context
  });
}

/** Rate-limited alert when readiness checks fail. */
export function logReadyCheckFailed(context = {}) {
  return logThresholdedAlert("ready_check_failed", context);
}
