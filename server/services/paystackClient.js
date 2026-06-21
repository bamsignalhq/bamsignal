import dns from "node:dns";
import { config } from "../config.js";
import { isRetryableNetworkError, withBoundedRetry } from "./retryPolicy.js";
import {
  logObservabilityEvent,
  logThresholdedAlert,
  observabilityContext
} from "./observability.js";
import { sanitizeApiErrorForLog } from "./errorResponse.js";

dns.setDefaultResultOrder("ipv4first");

const PAYSTACK_API_BASE = "https://api.paystack.co";
const DEFAULT_TIMEOUT_MS = 20000;

export const PAYMENT_INITIALIZE_CLIENT_ERROR = "Unable to start payment. Please try again.";
export const PAYMENT_VERIFY_CLIENT_ERROR = "Payment could not be verified. Please try again.";

export class PaystackClientError extends Error {
  code;
  status;
  upstreamStatus;
  upstreamMessage;
  upstreamBody;
  cause;

  constructor(
    message,
    {
      code = "paystack_error",
      status = 503,
      upstreamStatus,
      upstreamMessage,
      upstreamBody,
      cause
    } = {}
  ) {
    super(message);
    this.name = "PaystackClientError";
    this.code = code;
    this.status = status;
    this.upstreamStatus = upstreamStatus;
    this.upstreamMessage = upstreamMessage || null;
    this.upstreamBody = upstreamBody || null;
    this.cause = cause;
  }
}

function hasSecretKey() {
  return Boolean(config.paystackSecretKey);
}

export function paystackConfigured() {
  return hasSecretKey();
}

export async function resolvePaystackHost() {
  const started = Date.now();
  try {
    const addresses = await dns.promises.resolve4("api.paystack.co");
    return {
      ok: true,
      family: "ipv4",
      addresses,
      latencyMs: Date.now() - started
    };
  } catch (ipv4Error) {
    try {
      const addresses = await dns.promises.resolve("api.paystack.co");
      return {
        ok: true,
        family: "mixed",
        addresses,
        latencyMs: Date.now() - started,
        ipv4Error: "DNS resolution failed"
      };
    } catch (error) {
      return {
        ok: false,
        error: "DNS resolution failed",
        latencyMs: Date.now() - started
      };
    }
  }
}

export async function paystackFetch(path, options = {}) {
  if (!hasSecretKey()) {
    throw new PaystackClientError("PAYSTACK_SECRET_KEY is not configured.", {
      code: "not_configured",
      status: 503
    });
  }

  const url = path.startsWith("http") ? path : `${PAYSTACK_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const retryEnabled = options.retry !== false;
  const attempts = retryEnabled ? 3 : 1;

  return withBoundedRetry(
    async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);

      const headers = {
        Authorization: `Bearer ${config.paystackSecretKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {})
      };

      try {
        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal
        });

        const text = await response.text();
        let payload = null;
        if (text) {
          try {
            payload = JSON.parse(text);
          } catch {
            payload = { raw: text.slice(0, 240) };
          }
        }

        return { response, payload, url };
      } catch (error) {
        if (error?.name === "AbortError") {
          throw new PaystackClientError("Paystack request timed out.", {
            code: "timeout",
            status: 503,
            cause: error
          });
        }

        throw new PaystackClientError("Paystack network request failed.", {
          code: "network_error",
          status: 503,
          cause: error
        });
      } finally {
        clearTimeout(timer);
      }
    },
    {
      service: "paystack",
      attempts,
      shouldRetry: (error) => isRetryableNetworkError(error),
      context: { path: String(path).slice(0, 120) }
    }
  );
}

export async function probePaystackConnectivity() {
  const dnsResult = await resolvePaystackHost();
  const result = {
    ok: false,
    configured: hasSecretKey(),
    dns: dnsResult,
    head: null,
    initializeProbe: null,
    verifyProbe: null
  };

  try {
    const headStarted = Date.now();
    const head = await fetch(PAYSTACK_API_BASE, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000)
    });
    result.head = {
      ok: head.ok,
      status: head.status,
      latencyMs: Date.now() - headStarted
    };
  } catch (error) {
    result.head = {
      ok: false,
      error: "HEAD request failed"
    };
  }

  if (!hasSecretKey()) {
    result.error = "PAYSTACK_SECRET_KEY is not configured.";
    return result;
  }

  try {
    const initializeStarted = Date.now();
    const { response, payload } = await paystackFetch("/transaction/initialize", {
      method: "POST",
      retry: false,
      body: JSON.stringify({
        email: "connectivity-probe@bamsignal.com",
        amount: 10000,
        callback_url: config.paystackCallbackUrl
      })
    });
    result.initializeProbe = {
      ok: response.ok && payload?.status === true,
      status: response.status,
      paystackStatus: payload?.status ?? null,
      message: payload?.message || null,
      latencyMs: Date.now() - initializeStarted
    };
  } catch (error) {
    result.initializeProbe = {
      ok: false,
      error: "Initialize probe failed",
      code: error.code || "initialize_probe_failed"
    };
  }

  try {
    const verifyStarted = Date.now();
    const { response, payload } = await paystackFetch("/transaction/verify/connectivity_probe_ref", {
      method: "GET",
      retry: false
    });
    result.verifyProbe = {
      ok: response.ok,
      status: response.status,
      paystackStatus: payload?.status ?? null,
      message: payload?.message || null,
      latencyMs: Date.now() - verifyStarted
    };
  } catch (error) {
    result.verifyProbe = {
      ok: false,
      error: "Verify probe failed",
      code: error.code || "verify_probe_failed"
    };
  }

  const initializeStatus = result.initializeProbe?.status;
  result.reachable = Boolean(
    result.dns?.ok &&
      (result.head?.status || initializeStatus || result.verifyProbe?.status) &&
      !result.initializeProbe?.error &&
      !result.verifyProbe?.error
  );
  result.ok = Boolean(result.initializeProbe?.ok);
  result.authOk = initializeStatus === 200 || (initializeStatus && initializeStatus < 500 && result.initializeProbe?.paystackStatus !== false);

  return result;
}

function sanitizeProviderPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return payload ? { raw: String(payload).slice(0, 240) } : null;
  }
  return {
    status: payload.status ?? null,
    message: payload.message || null,
    code: payload.code || payload.type || null
  };
}

function providerErrorDetail(error, extra = {}) {
  const sanitized = sanitizeApiErrorForLog(error);
  if (error instanceof PaystackClientError) {
    return {
      code: error.code || null,
      upstreamStatus: error.upstreamStatus || null,
      providerMessage: sanitized.message,
      providerBody: error.upstreamBody ? "[redacted_provider_payload]" : null,
      errorCategory: sanitized.category,
      ...extra
    };
  }
  return {
    code: error?.code || null,
    message: sanitized.message,
    errorCategory: sanitized.category,
    ...extra
  };
}

export function logPaymentProviderError(req, scope, error, extra = {}) {
  const detail = providerErrorDetail(error, extra);
  logObservabilityEvent(
    "payment_provider_error",
    observabilityContext(req, { scope, ...detail }),
    "warn"
  );
  const alertEvent = scope === "initialize" ? "payment_initialize_failed" : "payment_verify_failed";
  logThresholdedAlert(alertEvent, observabilityContext(req, { scope, ...detail }));
}

export function paystackErrorResponse(error, clientMessage = PAYMENT_INITIALIZE_CLIENT_ERROR) {
  const status = error instanceof PaystackClientError ? error.status : 503;
  return {
    status,
    body: {
      ok: false,
      error: clientMessage
    }
  };
}

export async function initializePaystackTransaction(body) {
  const { response, payload } = await paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(body)
  });

  if (!response.ok || !payload?.status) {
    throw new PaystackClientError("Paystack initialize request failed.", {
      code: "initialize_failed",
      status: 503,
      upstreamStatus: response.status,
      upstreamMessage: payload?.message || null,
      upstreamBody: sanitizeProviderPayload(payload)
    });
  }

  return payload.data;
}

export async function verifyPaystackTransaction(reference) {
  const { response, payload } = await paystackFetch(
    `/transaction/verify/${encodeURIComponent(reference)}`,
    { method: "GET" }
  );

  if (!response.ok || !payload?.status) {
    throw new PaystackClientError("Paystack verify request failed.", {
      code: "verify_failed",
      status: 503,
      upstreamStatus: response.status,
      upstreamMessage: payload?.message || null,
      upstreamBody: sanitizeProviderPayload(payload)
    });
  }

  return payload.data;
}
