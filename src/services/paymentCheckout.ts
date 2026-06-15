import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import {
  getPaystackPublicKey,
  isValidPaystackPublicKey,
  paystackInlineReady
} from "../config/paystack";
import { STORAGE_KEYS } from "../constants/limits";
import { logPaymentEvent, setPaymentFlowState, parsePaymentReturnUrl } from "../utils/paymentState";

export type CheckoutOutcome =
  | { status: "paid"; reference: string }
  | { status: "cancelled" }
  | { status: "redirect" }
  | { status: "error"; message: string };

type PaystackInlineHandler = {
  openIframe: () => void;
};

type PaystackPop = {
  setup: (options: {
    key: string;
    access_code: string;
    onClose?: () => void;
    callback?: (response: { reference: string; status?: string }) => void;
  }) => PaystackInlineHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPop;
  }
}

const MIN_CHECKOUT_MS = 2000;
const INLINE_CANCEL_DEBOUNCE_MS = 900;

let paystackScriptPromise: Promise<PaystackPop> | null = null;

function loadPaystackInline(): Promise<PaystackPop> {
  if (paystackScriptPromise) return paystackScriptPromise;
  paystackScriptPromise = new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error("Paystack inline script failed to load."));
    };
    script.onerror = () => reject(new Error("Paystack inline script failed to load."));
    document.body.appendChild(script);
  });
  return paystackScriptPromise;
}

function persistCheckoutReference(reference: string, kind?: string): void {
  localStorage.setItem(STORAGE_KEYS.paymentReference, reference);
  if (kind) localStorage.setItem(STORAGE_KEYS.paymentKind, kind);
  logPaymentEvent("reference created", { reference, kind });
}

function openInlineCheckout(accessCode: string, reference: string, kind?: string): Promise<CheckoutOutcome> {
  const publicKey = getPaystackPublicKey();
  if (!isValidPaystackPublicKey(publicKey)) {
    logPaymentEvent("checkout blocked — invalid or missing public key", {
      hasKey: Boolean(publicKey)
    });
    return Promise.resolve({
      status: "error",
      message: "Payment could not start. Please try again."
    });
  }

  return loadPaystackInline().then(
    (PaystackPop) =>
      new Promise((resolve) => {
        let completed = false;
        let cancelTimer: ReturnType<typeof setTimeout> | null = null;
        const checkoutOpenedAt = Date.now();

        const handler = PaystackPop.setup({
          key: publicKey,
          access_code: accessCode,
          onClose: () => {
            if (completed) return;
            if (Date.now() - checkoutOpenedAt < MIN_CHECKOUT_MS) {
              logPaymentEvent("checkout close ignored (too early)", { reference });
              return;
            }
            cancelTimer = setTimeout(() => {
              if (!completed) {
                logPaymentEvent("checkout closed/cancelled", { reference, mode: "inline" });
                resolve({ status: "cancelled" });
              }
            }, INLINE_CANCEL_DEBOUNCE_MS);
          },
          callback: (response) => {
            if (cancelTimer) clearTimeout(cancelTimer);
            completed = true;
            logPaymentEvent("checkout callback", {
              reference: response?.reference || reference,
              status: response?.status
            });
            if (response?.reference) {
              resolve({ status: "paid", reference: response.reference });
            } else {
              resolve({ status: "cancelled" });
            }
          }
        });

        persistCheckoutReference(reference, kind);
        setPaymentFlowState("checkout_open");
        logPaymentEvent("checkout opening", { reference, mode: "inline", keyPrefix: publicKey.slice(0, 8) });
        handler.openIframe();
      })
  );
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

export async function openPaystackCheckout(options: {
  authorizationUrl: string;
  accessCode?: string | null;
  reference: string;
  kind?: string;
}): Promise<CheckoutOutcome> {
  const { authorizationUrl, accessCode, reference, kind } = options;

  if (accessCode && paystackInlineReady()) {
    try {
      const inline = await openInlineCheckout(accessCode, reference, kind);
      if (inline.status !== "error") return inline;
      logPaymentEvent("inline failed, falling back to hosted checkout", { reference });
    } catch (error) {
      logPaymentEvent("inline unavailable, using hosted checkout", { reference, error: String(error) });
    }
  } else if (accessCode && !paystackInlineReady()) {
    logPaymentEvent("inline skipped — missing VITE_PAYSTACK_PUBLIC_KEY, using hosted checkout", {
      reference
    });
  }

  if (Capacitor.isNativePlatform()) {
    return openCapacitorCheckout(authorizationUrl, reference, kind);
  }

  return openHostedRedirect(authorizationUrl, reference, kind);
}
