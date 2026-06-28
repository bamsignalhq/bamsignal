import { logRetryExhausted } from "./observability.js";
import {
  RETRY_BASE_DELAY_MS,
  RETRY_DEFAULT_ATTEMPTS,
  RETRY_MAX_DELAY_MS
} from "../../shared/operationalConstants.mjs";

const DEFAULT_ATTEMPTS = RETRY_DEFAULT_ATTEMPTS;
const DEFAULT_BASE_DELAY_MS = RETRY_BASE_DELAY_MS;
const DEFAULT_MAX_DELAY_MS = RETRY_MAX_DELAY_MS;

export function isRetryableHttpStatus(status) {
  const code = Number(status);
  if (!Number.isFinite(code)) return false;
  return code === 429 || code >= 500;
}

export function isRetryableNetworkError(error) {
  if (!error) return false;
  const code = String(error.code || error.name || "").toLowerCase();
  return (
    code === "aborterror" ||
    code === "timeout" ||
    code === "network_error" ||
    code === "econnreset" ||
    code === "etimedout" ||
    code === "enotfound" ||
    code === "eai_again"
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(attempt, baseDelayMs, maxDelayMs) {
  const exponential = baseDelayMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(maxDelayMs, exponential);
}

/**
 * Bounded retry with exponential backoff — logs retry_exhausted once per service key.
 */
export async function withBoundedRetry(task, options = {}) {
  const {
    service = "unknown",
    attempts = DEFAULT_ATTEMPTS,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    maxDelayMs = DEFAULT_MAX_DELAY_MS,
    shouldRetry = () => true,
    context = {}
  } = options;

  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task(attempt);
    } catch (error) {
      lastError = error;
      const retry = attempt < attempts && shouldRetry(error, attempt);
      if (!retry) {
        logRetryExhausted(service, {
          attempts,
          attempt,
          code: error?.code || null,
          ...context,
          error: error instanceof Error ? error.message : String(error || "unknown")
        });
        throw error;
      }
      await delay(backoffDelay(attempt, baseDelayMs, maxDelayMs));
    }
  }

  throw lastError;
}
