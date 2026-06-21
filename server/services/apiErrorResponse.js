import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
  createRequestId,
  getCorrelationId,
  getRequestId,
  logObservabilityEvent,
  observabilityContext
} from "./observability.js";

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

export function logSanitizedApiError(req, event, error, context = {}, level = "error") {
  ensureApiRequestContext(req);
  return logObservabilityEvent(
    event,
    observabilityContext(req, {
      ...context,
      error: error instanceof Error ? error.message : String(error || "unknown"),
      code: error?.code || null,
      status: error?.status || null,
      name: error?.name || null
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
