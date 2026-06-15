import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { STORAGE_KEYS } from "../constants/limits";
import { setPaymentFlowState, parsePaymentReturnUrl } from "../utils/paymentState";

export type CheckoutOutcome =
  | { status: "paid"; reference: string }
  | { status: "cancelled" }
  | { status: "redirect" };

type PaystackInlineHandler = {
  openIframe: () => void;
};

type PaystackPop = {
  setup: (options: {
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
}

function openInlineCheckout(accessCode: string, reference: string, kind?: string): Promise<CheckoutOutcome> {
  return loadPaystackInline().then(
    (PaystackPop) =>
      new Promise((resolve) => {
        let completed = false;
        const handler = PaystackPop.setup({
          access_code: accessCode,
          onClose: () => {
            if (!completed) resolve({ status: "cancelled" });
          },
          callback: (response) => {
            completed = true;
            if (response?.reference) {
              resolve({ status: "paid", reference: response.reference });
            } else {
              resolve({ status: "cancelled" });
            }
          }
        });
        persistCheckoutReference(reference, kind);
        setPaymentFlowState("checkout_open");
        handler.openIframe();
      })
  );
}

async function openCapacitorCheckout(authorizationUrl: string, reference: string, kind?: string): Promise<CheckoutOutcome> {
  return new Promise((resolve) => {
    let settled = false;
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
      void Browser.close().catch(() => undefined);
      finish({ status: "paid", reference: parsed.reference });
    });

    const finishedListener = Browser.addListener("browserFinished", () => {
      finish({ status: "cancelled" });
    });

    persistCheckoutReference(reference, kind);
    setPaymentFlowState("checkout_open");
    void Browser.open({
      url: authorizationUrl,
      presentationStyle: "popover",
      toolbarColor: "#1a0a2e"
    }).catch(() => finish({ status: "cancelled" }));
  });
}

export async function openPaystackCheckout(options: {
  authorizationUrl: string;
  accessCode?: string | null;
  reference: string;
  kind?: string;
}): Promise<CheckoutOutcome> {
  const { authorizationUrl, accessCode, reference, kind } = options;

  if (accessCode) {
    try {
      return await openInlineCheckout(accessCode, reference, kind);
    } catch (error) {
      console.warn("[payment] inline checkout unavailable, falling back to hosted checkout", error);
    }
  }

  if (Capacitor.isNativePlatform()) {
    return openCapacitorCheckout(authorizationUrl, reference, kind);
  }

  persistCheckoutReference(reference, kind);
  setPaymentFlowState("checkout_open");
  window.location.assign(authorizationUrl);
  return { status: "redirect" };
}
