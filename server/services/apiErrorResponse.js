import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  createRequestId,
  getCorrelationId,
  getRequestId,
  logObservabilityEvent,
  observabilityContext
} from "./observability.js";

const MAX_LOG_ERROR_LENGTH = 180;
const STACK_TRACE_PATTERN = /(?:^|\n)\s*at\s+.+:\d+:\d+|\bError:\s.*\n\s*at\s+/i;
const DATABASE_DETAIL_PATTERN =
  /\b(?:sql|select|insert|update|delete|alter|drop|create|truncate|from|where|join|constraint|violates|duplicate key|relation|syntax error|postgres|postgrest|pgrst|sqlstate|23505|42p01)\b/i;
const PROVIDER_DETAIL_PATTERN =
  /\b(?:paystack|sendchamp|provider|upstream|payload|gateway_response|authorization_url|access_code|sk_(?:test|live)_)\b/i;
const STORAGE_DETAIL_PATTERN =
  /\b(?:supabase|storage\/v1|bucket|object path|signed url|profile[-_]?photos|photo[-_]?uploads|voice[-_]?intro|cover[-_]?photos)\b/i;
const FILE_PATH_PATTERN =
  /(?:\/[A-Za-z0-9._-]+){2,}|[A-Za-z]:\\[^\s]+|(?:profile|photo|photos|voice|avatar|storage)[A-Za-z0-9/_ .-]+\.(?:jpg|jpeg|png|webp|mp3|m4a|wav)/i;
const CLIENT_SENSITIVE_PATTERN =
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|sk_(?:test|live)_[a-zA-Z0-9]+|Bearer\s+[a-zA-Z0-9._~+/=-]+|eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/i;

function headerValue(req, name) {
  const value = req?.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

export function ensureApiRequestContext(req = {}, res = null) {
  const requestId =
    getRequestId(req) || String(headerValue(req, REQUEST_ID_HEADER) || "").trim() || createRequestId();
  const correlationId =
    getCorrelationId(req) ||
    String(headerValue(req, CORRELATION_ID_HEADER) || "").trim() ||
    requestId;

  req.observability = {
    ...(req.observability || {}),
    requestId,
    correlationId
  };

  if (res?.setHeader) {
    res.setHeader(REQUEST_ID_HEADER, requestId);
    if (correlationId !== requestId) {
      res.setHeader(CORRELATION_ID_HEADER, correlationId);
    }
  }

  return { requestId, correlationId };
}

export { createRequestId };

function rawErrorMessage(error) {
  if (error instanceof Error) return error.message || error.name || "unknown";
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    return String(error.message || error.error || error.name || "unknown");
  }
  return String(error || "unknown");
}

export function sanitizeApiErrorForLog(error) {
  const raw = rawErrorMessage(error);
  const normalized = raw.replace(/\s+/g, " ").trim() || "unknown";
  const source = `${raw}\n${error?.stack || ""}`;
  const hasStackTrace = STACK_TRACE_PATTERN.test(source);
  let category = "application_error";
  let message = normalized.slice(0, MAX_LOG_ERROR_LENGTH);

  if (DATABASE_DETAIL_PATTERN.test(source)) {
    category = "database_error";
    message = "database_error";
  } else if (STORAGE_DETAIL_PATTERN.test(source)) {
    category = "storage_error";
    message = "storage_error";
  } else if (PROVIDER_DETAIL_PATTERN.test(source)) {
    category = "provider_error";
    message = "provider_error";
  } else if (hasStackTrace) {
    category = "stack_trace";
    message = "stack_trace_redacted";
  } else if (FILE_PATH_PATTERN.test(source)) {
    category = "path_detail";
    message = "path_detail_redacted";
  }

  return {
    category,
    message,
    code: error?.code || null,
    status: error?.status || null,
    name: error?.name || null
  };
}

export function safeClientMessage(message, fallback = "Request failed.") {
  const raw = String(message || "").replace(/\s+/g, " ").trim();
  if (!raw || raw.length > 240 || CLIENT_SENSITIVE_PATTERN.test(raw)) return fallback;
  const sanitized = sanitizeApiErrorForLog({ message: raw });
  if (sanitized.category !== "application_error") return fallback;
  return raw;
}

export function logSanitizedApiError(req, event, error, context = {}, level = "error") {
  ensureApiRequestContext(req);
  const sanitized = sanitizeApiErrorForLog(error);
  return logObservabilityEvent(
    event,
    observabilityContext(req, {
      ...context,
      error: sanitized.message,
      errorCategory: sanitized.category,
      code: sanitized.code,
      status: sanitized.status,
      name: sanitized.name
    }),
    level
  );
}

export function sendApiError(res, { status = 500, message = "Request failed.", requestId, body = {} }) {
  return res.status(status).json({
    ok: false,
    error: message,
    requestId,
    ...body
  });
}

export function clientError(res, options = {}) {
  return sendApiError(res, options);
}

export function logError(req, event, error, context = {}, level = "error") {
  return logSanitizedApiError(req, event, error, context, level);
}

export function sendLoggedApiError({
  req,
  res,
  event = "unhandled_request_error",
  error,
  status = 500,
  message = "Request failed.",
  context = {},
  level = "error",
  body = {}
}) {
  const { requestId } = ensureApiRequestContext(req, res);
  logSanitizedApiError(req, event, error, context, level);
  return sendApiError(res, { status, message, requestId, body });
}
