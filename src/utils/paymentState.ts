import { STORAGE_KEYS } from "../constants/limits";
import { readJson, writeJson } from "./storage";

export type PaymentFlowState =
  | "idle"
  | "initializing"
  | "checkout_open"
  | "verifying"
  | "success"
  | "failed"
  | "cancelled";

const PAYMENT_STATE_EVENT = "bamsignal-payment-state";

/** Legacy keys from older builds — always cleared on new payment. */
const LEGACY_PAYMENT_KEYS = [
  "bamsignal-payment-cancelled",
  "bamsignal-payment-pending-payment",
  "bamsignal-last-payment-status",
  "paymentPending",
  "paymentReference",
  "paymentCancelled",
  "pendingPayment",
  "lastPaymentStatus"
] as const;

export function logPaymentEvent(event: string, detail?: Record<string, unknown>): void {
  if (detail && Object.keys(detail).length > 0) {
    console.info(`[payment] ${event}`, detail);
  } else {
    console.info(`[payment] ${event}`);
  }
}

function notifyPaymentStateChange(state: PaymentFlowState): void {
  if (typeof window === "undefined") return;
  logPaymentEvent("state transition", { state });
  window.dispatchEvent(new CustomEvent(PAYMENT_STATE_EVENT, { detail: state }));
}

export function subscribePaymentState(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => onChange();
  window.addEventListener(PAYMENT_STATE_EVENT, handler);
  return () => window.removeEventListener(PAYMENT_STATE_EVENT, handler);
}

export function getPaymentFlowState(): PaymentFlowState {
  const raw = readJson<string | null>(STORAGE_KEYS.paymentFlowState, null);
  if (
    raw === "initializing" ||
    raw === "checkout_open" ||
    raw === "verifying" ||
    raw === "success" ||
    raw === "failed" ||
    raw === "cancelled"
  ) {
    return raw;
  }
  return "idle";
}

export function isActivePaymentFlow(): boolean {
  const state = getPaymentFlowState();
  return state === "initializing" || state === "checkout_open" || state === "verifying";
}

export function checkoutWasOpened(): boolean {
  return localStorage.getItem(STORAGE_KEYS.paymentCheckoutOpened) === "1";
}

export function clearLegacyPaymentFlags(): void {
  for (const key of LEGACY_PAYMENT_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
  localStorage.removeItem(STORAGE_KEYS.paymentPending);
}

export function setPaymentFlowState(state: PaymentFlowState): void {
  writeJson(STORAGE_KEYS.paymentFlowState, state);

  if (state === "checkout_open") {
    localStorage.setItem(STORAGE_KEYS.paymentCheckoutOpened, "1");
  }

  if (state === "idle" || state === "success") {
    localStorage.removeItem(STORAGE_KEYS.paymentPending);
    localStorage.removeItem(STORAGE_KEYS.paymentCheckoutOpened);
  } else if (state === "cancelled") {
    if (checkoutWasOpened()) {
      localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
    }
  } else if (state === "failed") {
    if (checkoutWasOpened()) {
      localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
    } else {
      localStorage.removeItem(STORAGE_KEYS.paymentPending);
    }
  } else {
    localStorage.removeItem(STORAGE_KEYS.paymentPending);
  }

  notifyPaymentStateChange(state);
}

/** Start a fresh payment attempt — clears stale banners and old references. */
export function beginPaymentSession(): void {
  clearLegacyPaymentFlags();
  localStorage.removeItem(STORAGE_KEYS.paymentReference);
  localStorage.removeItem(STORAGE_KEYS.paymentKind);
  localStorage.removeItem(STORAGE_KEYS.paymentBoostId);
  localStorage.removeItem(STORAGE_KEYS.paymentCheckoutOpened);
  localStorage.removeItem(STORAGE_KEYS.paymentStartedAt);
  localStorage.removeItem(STORAGE_KEYS.paymentReturnPath);
  localStorage.removeItem(STORAGE_KEYS.paymentProductType);
  localStorage.removeItem(STORAGE_KEYS.paymentProductId);
  localStorage.removeItem(STORAGE_KEYS.paymentSourcePage);
  writeJson(STORAGE_KEYS.paymentFlowState, "initializing");
  logPaymentEvent("session started");
  notifyPaymentStateChange("initializing");
}

function hasPaymentReturnInUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return Boolean(params.get("trxref") || params.get("reference") || params.get("status"));
}

/** Drop orphaned failed/cancelled sessions from prior app loads. */
export function sanitizeStalePaymentState(): void {
  clearLegacyPaymentFlags();

  if (hasPaymentReturnInUrl()) return;

  const state = getPaymentFlowState();
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();

  if (state === "failed" || state === "cancelled") {
    clearPaymentSession();
    return;
  }

  const startedAt = Number(localStorage.getItem(STORAGE_KEYS.paymentStartedAt) || 0);
  const staleMs = 30 * 60 * 1000;
  const isStale = startedAt > 0 && Date.now() - startedAt > staleMs;

  if (isStale && state !== "idle" && state !== "success") {
    clearPaymentSession();
    return;
  }

  if ((state === "initializing" || state === "checkout_open" || state === "verifying") && !reference) {
    clearPaymentSession();
  }
}

export function markPaymentSessionStarted(): void {
  localStorage.setItem(STORAGE_KEYS.paymentStartedAt, String(Date.now()));
}

export function clearPaymentSession(): void {
  clearLegacyPaymentFlags();
  localStorage.removeItem(STORAGE_KEYS.paymentReference);
  localStorage.removeItem(STORAGE_KEYS.paymentKind);
  localStorage.removeItem(STORAGE_KEYS.paymentBoostId);
  localStorage.removeItem(STORAGE_KEYS.paymentPending);
  localStorage.removeItem(STORAGE_KEYS.paymentCheckoutOpened);
  localStorage.removeItem(STORAGE_KEYS.paymentStartedAt);
  localStorage.removeItem(STORAGE_KEYS.paymentReturnPath);
  localStorage.removeItem(STORAGE_KEYS.paymentProductType);
  localStorage.removeItem(STORAGE_KEYS.paymentProductId);
  localStorage.removeItem(STORAGE_KEYS.paymentSourcePage);
  writeJson(STORAGE_KEYS.paymentFlowState, "idle");
  notifyPaymentStateChange("idle");
}

export function shouldShowPaymentRecovery(): boolean {
  if (isActivePaymentFlow()) return false;

  const state = getPaymentFlowState();
  if (state === "cancelled") return checkoutWasOpened();
  if (state === "failed") return checkoutWasOpened();
  return false;
}

export function parsePaymentReturnUrl(rawUrl: string): { reference: string } | null {
  try {
    const url = rawUrl.includes("://") ? new URL(rawUrl) : new URL(rawUrl, "https://bamsignal.com");
    const reference = url.searchParams.get("trxref") || url.searchParams.get("reference");
    if (!reference?.trim()) return null;
    if (
      url.pathname.includes("/payment/success") ||
      url.hostname === "bamsignal.com" ||
      url.hostname === "payment-success" ||
      url.protocol === "bamsignal:" ||
      url.protocol === "com.bamsignal.com:"
    ) {
      return { reference: reference.trim() };
    }
    return null;
  } catch {
    return null;
  }
}
