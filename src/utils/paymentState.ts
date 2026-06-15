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

function notifyPaymentStateChange(state: PaymentFlowState): void {
  if (typeof window === "undefined") return;
  console.info("[payment] state →", state);
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

export function checkoutWasOpened(): boolean {
  return localStorage.getItem(STORAGE_KEYS.paymentCheckoutOpened) === "1";
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
    localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
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
  localStorage.removeItem(STORAGE_KEYS.paymentReference);
  localStorage.removeItem(STORAGE_KEYS.paymentKind);
  localStorage.removeItem(STORAGE_KEYS.paymentBoostId);
  localStorage.removeItem(STORAGE_KEYS.paymentPending);
  localStorage.removeItem(STORAGE_KEYS.paymentCheckoutOpened);
  writeJson(STORAGE_KEYS.paymentFlowState, "initializing");
  notifyPaymentStateChange("initializing");
}

/** Drop orphaned failed/cancelled sessions from prior app loads. */
export function sanitizeStalePaymentState(): void {
  const state = getPaymentFlowState();
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();

  if ((state === "failed" || state === "cancelled") && !reference) {
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

  if (state === "initializing" || state === "checkout_open" || state === "verifying") {
    if (!reference) {
      clearPaymentSession();
    }
  }
}

export function markPaymentSessionStarted(): void {
  localStorage.setItem(STORAGE_KEYS.paymentStartedAt, String(Date.now()));
}

export function clearPaymentSession(): void {
  localStorage.removeItem(STORAGE_KEYS.paymentReference);
  localStorage.removeItem(STORAGE_KEYS.paymentKind);
  localStorage.removeItem(STORAGE_KEYS.paymentBoostId);
  localStorage.removeItem(STORAGE_KEYS.paymentPending);
  localStorage.removeItem(STORAGE_KEYS.paymentCheckoutOpened);
  localStorage.removeItem(STORAGE_KEYS.paymentStartedAt);
  writeJson(STORAGE_KEYS.paymentFlowState, "idle");
  notifyPaymentStateChange("idle");
}

export function shouldShowPaymentRecovery(): boolean {
  const state = getPaymentFlowState();
  if (state === "initializing" || state === "checkout_open" || state === "verifying") {
    return false;
  }
  if (state === "cancelled") return true;
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
