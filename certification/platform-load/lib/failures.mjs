import { PLATFORM_LOAD_RETRY } from "../../../shared/platformLoadCertification.mjs";

const RETRIABLE_ERROR_PATTERNS = [
  /ECONNRESET/i,
  /ECONNREFUSED/i,
  /EPIPE/i,
  /ETIMEDOUT/i,
  /socket hang up/i,
  /fetch failed/i,
  /network/i
];

export function classifyRequestFailure({ status, error, retried = false }) {
  if (error === "timeout") {
    return retried ? "retry_exhaustion" : "timeout";
  }
  if (error && /abort/i.test(String(error))) {
    return "aborted_request";
  }
  if (status === 429) {
    return "api_throttling";
  }
  if (status === 0 || (error && RETRIABLE_ERROR_PATTERNS.some((pattern) => pattern.test(String(error))))) {
    return "connection_exhaustion";
  }
  if (status === 408 || status === 504) {
    return retried ? "retry_exhaustion" : "timeout";
  }
  if (status >= 502 && status <= 503) {
    return retried ? "retry_exhaustion" : "worker_starvation";
  }
  if (status === 500) {
    return "worker_starvation";
  }
  if (status === 401 || status === 403) {
    return "session_expiration";
  }
  if (status >= 400) {
    return "unexpected_response";
  }
  return "unknown";
}

export function isRetriableRequest(step, { status, error }, attempt) {
  if (attempt >= PLATFORM_LOAD_RETRY.maxAttempts) return false;
  const method = (step.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  if (error === "timeout") return true;
  if (error && RETRIABLE_ERROR_PATTERNS.some((pattern) => pattern.test(String(error)))) {
    return true;
  }
  return PLATFORM_LOAD_RETRY.retriableStatuses.includes(status);
}

export function retryBackoffMs(attempt) {
  const exponential = PLATFORM_LOAD_RETRY.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const jitter = Math.floor(Math.random() * PLATFORM_LOAD_RETRY.baseDelayMs);
  return Math.min(PLATFORM_LOAD_RETRY.maxDelayMs, exponential + jitter);
}
