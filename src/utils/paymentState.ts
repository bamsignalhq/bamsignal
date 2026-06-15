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

export function setPaymentFlowState(state: PaymentFlowState): void {
  writeJson(STORAGE_KEYS.paymentFlowState, state);
  if (state === "failed" || state === "cancelled") {
    localStorage.setItem(STORAGE_KEYS.paymentPending, "1");
  } else if (state === "idle" || state === "success") {
    localStorage.removeItem(STORAGE_KEYS.paymentPending);
  }
}

export function clearPaymentSession(): void {
  localStorage.removeItem(STORAGE_KEYS.paymentReference);
  localStorage.removeItem(STORAGE_KEYS.paymentKind);
  localStorage.removeItem(STORAGE_KEYS.paymentBoostId);
  localStorage.removeItem(STORAGE_KEYS.paymentPending);
  writeJson(STORAGE_KEYS.paymentFlowState, "idle");
}

export function shouldShowPaymentRecovery(): boolean {
  const state = getPaymentFlowState();
  return state === "failed" || state === "cancelled";
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
