import type { NavTab } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { isMemberAppPath } from "../constants/memberRoutes";
import { normalizePath } from "../constants/routes";
import { logPaymentEvent } from "./paymentState";

export type PaymentReturnContext = {
  returnPath: string;
  productType: "premium" | "boost" | "quickie";
  productId: string;
  sourcePage: string;
  reference?: string;
};

const DEFAULT_RETURN_PATH = "/home";

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
  localStorage.setItem(STORAGE_KEYS.paymentReturnPath, context.returnPath);
  localStorage.setItem(STORAGE_KEYS.paymentProductType, context.productType);
  localStorage.setItem(STORAGE_KEYS.paymentProductId, context.productId);
  localStorage.setItem(STORAGE_KEYS.paymentSourcePage, context.sourcePage);
  if (context.reference) {
    localStorage.setItem(STORAGE_KEYS.paymentReference, context.reference);
  }
  logPaymentEvent("payment_initialized", {
    returnPath: context.returnPath,
    productType: context.productType,
    productId: context.productId,
    sourcePage: context.sourcePage,
    reference: context.reference
  });
}

export function getPaymentReturnPath(): string {
  if (typeof window === "undefined") return DEFAULT_RETURN_PATH;
  const stored = localStorage.getItem(STORAGE_KEYS.paymentReturnPath)?.trim();
  if (stored && (stored.startsWith("/") || isMemberAppPath(stored))) {
    return normalizePath(stored);
  }
  return DEFAULT_RETURN_PATH;
}

export function getPaymentReturnMeta(): Pick<PaymentReturnContext, "productType" | "productId" | "sourcePage"> {
  const productType = localStorage.getItem(STORAGE_KEYS.paymentProductType)?.trim();
  return {
    productType:
      productType === "boost" || productType === "quickie" || productType === "premium"
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
  if (!reference?.trim()) return false;
  const status = params.get("status")?.trim().toLowerCase();
  if (status === "cancelled" || status === "failed") return false;
  return true;
}

export function isPaymentReturnRoute(pathname = typeof window !== "undefined" ? window.location.pathname : "/"): boolean {
  const path = normalizePath(pathname);
  return path === "/payment/success" || hasPaystackCallbackInUrl();
}

export function clearPaystackCallbackParams(returnPath: string): void {
  if (typeof window === "undefined") return;
  navigateReplace(returnPath);
}

function navigateReplace(path: string): void {
  window.history.replaceState(null, "", path);
}
