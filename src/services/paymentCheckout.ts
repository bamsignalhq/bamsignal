import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { PAYMENT_START_ERROR } from "../config/paystack";
import { STORAGE_KEYS } from "../constants/limits";
import { logPaymentEvent, setPaymentFlowState, parsePaymentReturnUrl } from "../utils/paymentState";

export type CheckoutOutcome =
  | { status: "paid"; reference: string }
  | { status: "cancelled" }
  | { status: "redirect" }
  | { status: "error"; message: string };

const MIN_CHECKOUT_MS = 2000;

/** Hosted Paystack checkout URL from initialize — no public key required on the client. */
export function isValidPaystackAuthorizationUrl(url: string): boolean {
  return /^https:\/\/checkout\.paystack\.com\/[a-zA-Z0-9_-]+/.test(url.trim());
}

function persistCheckoutReference(reference: string, kind?: string): void {
  localStorage.setItem(STORAGE_KEYS.paymentReference, reference);
  if (kind) localStorage.setItem(STORAGE_KEYS.paymentKind, kind);
  logPaymentEvent("reference created", { reference, kind });
}

async function openCapacitorCheckout(
  authorizationUrl: string,
  reference: string,
  kind?: string
): Promise<CheckoutOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    let paid = false;
    let browserOpenedAt = 0;

    const finish = (outcome: CheckoutOutcome) => {
      if (settled) return;
      settled = true;
      void urlListener.then((l) => l.remove());
      void finishedListener.then((l) => l.remove());
      resolve(outcome);
    };

    const urlListener = App.addListener("appUrlOpen", (event) => {
      const parsed = parsePaymentReturnUrl(event.url);
      if (!parsed) return;
      paid = true;
      logPaymentEvent("checkout callback", { reference: parsed.reference, mode: "in-app-browser" });
      void Browser.close().catch(() => undefined);
      finish({ status: "paid", reference: parsed.reference });
    });

    const finishedListener = Browser.addListener("browserFinished", () => {
      if (!browserOpenedAt) return;
      if (paid) return;
      const elapsed = Date.now() - browserOpenedAt;
      if (elapsed < MIN_CHECKOUT_MS) {
        logPaymentEvent("browserFinished ignored (too early)", { reference, elapsedMs: elapsed });
        return;
      }
      logPaymentEvent("checkout closed/cancelled", { reference, mode: "in-app-browser", elapsedMs: elapsed });
      finish({ status: "cancelled" });
    });

    persistCheckoutReference(reference, kind);
    setPaymentFlowState("checkout_open");
    logPaymentEvent("checkout opening", { reference, mode: "in-app-browser" });

    void Browser.open({
      url: authorizationUrl,
      presentationStyle: "popover",
      toolbarColor: "#1a0a2e"
    })
      .then(() => {
        browserOpenedAt = Date.now();
      })
      .catch((error) => {
        logPaymentEvent("checkout open failed", { reference, error: String(error) });
        finish({ status: "cancelled" });
      });
  });
}

function openHostedRedirect(authorizationUrl: string, reference: string, kind?: string): CheckoutOutcome {
  persistCheckoutReference(reference, kind);
  setPaymentFlowState("checkout_open");
  logPaymentEvent("checkout opening", { reference, mode: "redirect" });
  window.location.assign(authorizationUrl);
  return { status: "redirect" };
}

/**
 * Open Paystack via server-provided authorization_url (hosted checkout).
 * Never uses PaystackPop inline — avoids "valid Key" errors when the public key is missing or wrong.
 */
export async function openPaystackCheckout(options: {
  authorizationUrl: string;
  reference: string;
  kind?: string;
}): Promise<CheckoutOutcome> {
  const { authorizationUrl, reference, kind } = options;

  if (!isValidPaystackAuthorizationUrl(authorizationUrl)) {
    logPaymentEvent("checkout blocked — invalid authorization_url", { reference });
    return { status: "error", message: PAYMENT_START_ERROR };
  }

  if (Capacitor.isNativePlatform()) {
    return openCapacitorCheckout(authorizationUrl, reference, kind);
  }

  return openHostedRedirect(authorizationUrl, reference, kind);
}
