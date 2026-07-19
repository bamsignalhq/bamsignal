import type { NavTab } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { isMemberAppPath } from "../constants/memberRoutes";
import { isSignalConciergeRoute } from "../constants/signalConciergeRoutes";
import { normalizePath } from "../constants/routes";
import { logPaymentEvent } from "./paymentState";

export type PaymentReturnContext = {
  returnPath: string;
  productType:
    | "premium"
    | "boost"
    | "quickie"
    | "fast_connection"
    | "wallet_funding"
    | "conversation_unlock"
    | "discreet"
    | "concierge_invoice";
  productId: string;
  sourcePage: string;
  reference?: string;
};

const DEFAULT_RETURN_PATH = "/home";

export function normalizePaymentReturnPath(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw || raw === "/" || raw.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(raw)) {
    return DEFAULT_RETURN_PATH;
  }
  const appPath = normalizePath(raw.split(/[?#]/)[0]);
  if (isMemberAppPath(appPath) || isSignalConciergeRoute(appPath)) {
    return raw.replace(/\/$/, "") || DEFAULT_RETURN_PATH;
  }
  return DEFAULT_RETURN_PATH;
}

export function resolvePaymentReturnPath(options?: {
  tab?: NavTab;
  pathname?: string;
  sourcePage?: string;
}): string {
  const path = normalizePath(options?.pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/"));
  if (path === "/settings") return "/settings";
  if (path === "/profile" || options?.tab === "me") return "/profile";
  if (path === "/home" || options?.tab === "home") return "/home";
  if (isMemberAppPath(path)) return path;
  return DEFAULT_RETURN_PATH;
}

export function savePaymentReturnContext(context: PaymentReturnContext): void {
  if (typeof window === "undefined") return;
  const returnPath = normalizePaymentReturnPath(context.returnPath);
  localStorage.setItem(STORAGE_KEYS.paymentReturnPath, returnPath);
  localStorage.setItem(STORAGE_KEYS.paymentProductType, context.productType);
  localStorage.setItem(STORAGE_KEYS.paymentProductId, context.productId);
  localStorage.setItem(STORAGE_KEYS.paymentSourcePage, normalizePaymentReturnPath(context.sourcePage));
  if (!localStorage.getItem(STORAGE_KEYS.paymentStartedAt)) {
    localStorage.setItem(STORAGE_KEYS.paymentStartedAt, String(Date.now()));
  }
  if (context.reference) {
    localStorage.setItem(STORAGE_KEYS.paymentReference, context.reference);
  }
  logPaymentEvent("payment_initialized", {
    returnPath,
    productType: context.productType,
    productId: context.productId,
    sourcePage: normalizePaymentReturnPath(context.sourcePage),
    reference: context.reference
  });
}

export function getPaymentReturnPath(): string {
  if (typeof window === "undefined") return DEFAULT_RETURN_PATH;
  const stored = localStorage.getItem(STORAGE_KEYS.paymentReturnPath)?.trim();
  return normalizePaymentReturnPath(stored);
}

export function getPaymentReturnMeta(): Pick<PaymentReturnContext, "productType" | "productId" | "sourcePage"> {
  const productType = localStorage.getItem(STORAGE_KEYS.paymentProductType)?.trim();
  return {
    productType:
      productType === "boost" ||
      productType === "quickie" ||
      productType === "premium" ||
      productType === "fast_connection" ||
      productType === "conversation_unlock" ||
      productType === "discreet" ||
      productType === "concierge_invoice"
        ? productType
        : "premium",
    productId: localStorage.getItem(STORAGE_KEYS.paymentProductId)?.trim() || "monthly",
    sourcePage: localStorage.getItem(STORAGE_KEYS.paymentSourcePage)?.trim() || "unknown"
  };
}

export function clearPaymentReturnContext(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.paymentReturnPath);
  localStorage.removeItem(STORAGE_KEYS.paymentProductType);
  localStorage.removeItem(STORAGE_KEYS.paymentProductId);
  localStorage.removeItem(STORAGE_KEYS.paymentSourcePage);
}

export function hasPaystackCallbackInUrl(search = typeof window !== "undefined" ? window.location.search : ""): boolean {
  const params = new URLSearchParams(search);
  const reference = params.get("trxref") || params.get("reference");
  const status = params.get("status")?.trim().toLowerCase();
  return Boolean(reference?.trim() || status);
}

export function isPaymentReturnRoute(pathname = typeof window !== "undefined" ? window.location.pathname : "/"): boolean {
  const path = normalizePath(pathname);
  return path === "/payment/success" || hasPaystackCallbackInUrl();
}

export function clearPaystackCallbackParams(returnPath: string): void {
  if (typeof window === "undefined") return;
  navigateReplace(returnPath);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function navigateReplace(path: string): void {
  window.history.replaceState(null, "", path);
}
