import { Capacitor } from "@capacitor/core";
import type { PremiumPlan } from "../constants/plans";
import { DEFAULT_PREMIUM_PLANS } from "../constants/plans";
import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";
import { readJson } from "../utils/storage";
import { getMemberCity } from "../utils/memberCity";
import {
  beginPaymentSession,
  checkoutWasOpened,
  logPaymentEvent,
  markPaymentSessionStarted,
  setPaymentFlowState
} from "../utils/paymentState";
import { PAYMENT_START_ERROR } from "../config/paystack";
import {
  getPaymentReturnMeta,
  getPaymentReturnPath,
  normalizePaymentReturnPath,
  resolvePaymentReturnPath,
  savePaymentReturnContext,
  type PaymentReturnContext
} from "../utils/paymentReturn";
import { openPaystackCheckout } from "./paymentCheckout";
import { apiUrl } from "./supabase";
import { setPremiumSnapshot, isPremiumActive, refreshPremiumStatus } from "./premiumStatus";
import { readResponseJson } from "../utils/httpJson";
import { activateQuickiePass, fastConnectionWeeklyAmount, quickiePassDays } from "../utils/quickie";
import { fetchSubscriptionCatalog } from "./subscriptionCatalog";

export { isPremiumActive, refreshPremiumStatus };
export { clearPaymentSession } from "../utils/paymentState";

const INIT_ERROR = PAYMENT_START_ERROR;

function paymentPlatform(): "native" | "web" {
  return Capacitor.isNativePlatform() ? "native" : "web";
}

type InitPayload = {
  ok: boolean;
  error?: string;
  reference?: string;
  authorization_url?: string;
  access_code?: string;
};

type StartPaymentResult = {
  ok: boolean;
  error?: string;
  reference?: string;
  cancelled?: boolean;
  redirected?: boolean;
  needsVerify?: boolean;
};

export type PaymentCheckoutPhase = "preparing" | "opening";

type CheckoutCallbacks = {
  onPhase?: (phase: PaymentCheckoutPhase) => void;
};

type PaymentKind = "premium" | "boost" | "quickie";

type VerifyPaymentPayload = {
  ok?: boolean;
  error?: string;
  productType?: PaymentKind;
  productId?: string;
  returnPath?: string;
  sourcePage?: string;
  premium_until?: string;
  quickiePassUntil?: string;
  fastConnectionPassUntil?: string;
  boostId?: string;
  expiresAt?: string;
};

type VerifyResult = {
  ok: boolean;
  error?: string;
  pending?: boolean;
  productType?: PaymentKind;
  productId?: string;
  returnPath?: string;
  sourcePage?: string;
  premiumUntil?: string;
  quickiePassUntil?: string;
  boostId?: string;
  expiresAt?: string;
};

function normalizePaymentKind(kind?: string | null): PaymentKind {
  return kind === "boost" || kind === "quickie" || kind === "premium" ? kind : "premium";
}

function currentPaymentReturnBody(): Pick<PaymentReturnContext, "returnPath" | "productType" | "productId" | "sourcePage"> {
  const meta = getPaymentReturnMeta();
  return {
    returnPath: getPaymentReturnPath(),
    productType: meta.productType,
    productId: meta.productId,
    sourcePage: meta.sourcePage
  };
}

function buildReturnContext(
  kind: PaymentKind,
  productId: string,
  returnContext?: Partial<PaymentReturnContext>,
  fallbackReturnPath = resolvePaymentReturnPath()
): PaymentReturnContext {
  const returnPath = normalizePaymentReturnPath(returnContext?.returnPath || fallbackReturnPath);
  return {
    returnPath,
    productType: kind,
    productId: returnContext?.productId || productId,
    sourcePage: normalizePaymentReturnPath(returnContext?.sourcePage || returnPath)
  };
}

async function postInitialize(url: string, body: Record<string, unknown>): Promise<InitPayload> {
  const started = typeof performance !== "undefined" ? performance.now() : 0;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await readResponseJson<InitPayload & { error?: string }>(response);
  if (!response.ok || !payload?.ok || !payload.authorization_url) {
    logPaymentEvent("initialize failed", { url, error: payload?.error });
    return { ok: false, error: payload?.error || INIT_ERROR };
  }
  logPaymentEvent("payment initialized", {
    reference: payload.reference,
    hasAccessCode: Boolean(payload.access_code),
    ms: started ? Math.round(performance.now() - started) : undefined
  });
  return payload as InitPayload;
}

async function launchCheckout(
  init: InitPayload,
  kind: PaymentKind,
  extraKeys?: Record<string, string>,
  returnContext?: Partial<PaymentReturnContext>
): Promise<StartPaymentResult> {
  if (!init.reference) {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }

  savePaymentReturnContext({
    returnPath: returnContext?.returnPath || resolvePaymentReturnPath(),
    productType: returnContext?.productType || kind,
    productId: returnContext?.productId || (kind === "boost" ? extraKeys?.[STORAGE_KEYS.paymentBoostId] || "city-boost" : kind === "quickie" ? "fast-connection-pass" : "monthly"),
    sourcePage: returnContext?.sourcePage || resolvePaymentReturnPath(),
    reference: init.reference
  });

  localStorage.setItem(STORAGE_KEYS.paymentKind, kind);
  if (extraKeys) {
    for (const [key, value] of Object.entries(extraKeys)) {
      localStorage.setItem(key, value);
    }
  }

  const outcome = await openPaystackCheckout({
    authorizationUrl: init.authorization_url!,
    reference: init.reference,
    kind
  });

  if (outcome.status === "error") {
    setPaymentFlowState("idle");
    return { ok: false, error: outcome.message };
  }

  if (outcome.status === "redirect") {
    return { ok: true, reference: init.reference, redirected: true };
  }

  if (outcome.status === "cancelled") {
    if (checkoutWasOpened()) {
      setPaymentFlowState("cancelled");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, cancelled: true };
  }

  localStorage.setItem(STORAGE_KEYS.paymentReference, outcome.reference);
  setPaymentFlowState("verifying");
  logPaymentEvent("verification started", { reference: outcome.reference });
  return { ok: true, reference: outcome.reference, needsVerify: true };
}

export async function startPlanPayment(
  plan: PremiumPlan,
  user: UserProfile,
  callbacks: CheckoutCallbacks = {},
  returnContext?: Partial<PaymentReturnContext>
): Promise<StartPaymentResult> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before upgrading." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();
  callbacks.onPhase?.("preparing");

  try {
    const paymentReturnContext = buildReturnContext("premium", plan.id, returnContext);
    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      days: plan.days,
      amount: plan.price,
      plan: plan.id,
      platform: paymentPlatform(),
      returnPath: paymentReturnContext.returnPath,
      sourcePage: paymentReturnContext.sourcePage,
      productType: paymentReturnContext.productType,
      productId: paymentReturnContext.productId
    });

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    callbacks.onPhase?.("opening");
    return await launchCheckout(init, "premium", undefined, paymentReturnContext);
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export function startWeeklyPassPayment(
  user: UserProfile,
  plans = DEFAULT_PREMIUM_PLANS,
  callbacks: CheckoutCallbacks = {}
) {
  const plan = plans.find((p) => p.id === "weekly") || plans[0];
  return startPlanPayment(plan, user, callbacks);
}

export function startMonthlyPassPayment(
  user: UserProfile,
  plans = DEFAULT_PREMIUM_PLANS,
  callbacks: CheckoutCallbacks = {}
) {
  const plan = plans.find((p) => p.id === "monthly") || plans[1] || plans[0];
  return startPlanPayment(plan, user, callbacks);
}

export function startQuarterlyPassPayment(
  user: UserProfile,
  plans = DEFAULT_PREMIUM_PLANS,
  callbacks: CheckoutCallbacks = {}
) {
  const plan = plans.find((p) => p.id === "quarterly") || plans[2] || plans[0];
  return startPlanPayment(plan, user, callbacks);
}

export async function verifyPayment(user: UserProfile): Promise<{
  ok: boolean;
  premiumUntil?: string;
  error?: string;
  pending?: boolean;
} & VerifyResult> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const returnBody = currentPaymentReturnBody();
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name,
        ...returnBody
      })
    });
    const payload = await readResponseJson<VerifyPaymentPayload>(response);
    if (response.status === 402) {
      return { ok: false, pending: true, error: payload?.error || "Payment not completed." };
    }
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    if (payload.premium_until) {
      setPremiumSnapshot({ isPremium: true, premiumUntil: payload.premium_until });
    }
    return {
      ok: true,
      premiumUntil: payload.premium_until,
      productType: normalizePaymentKind(payload.productType),
      productId: payload.productId,
      returnPath: payload.returnPath,
      sourcePage: payload.sourcePage,
      quickiePassUntil: payload.quickiePassUntil || payload.fastConnectionPassUntil,
      boostId: payload.boostId,
      expiresAt: payload.expiresAt
    };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startQuickiePassPayment(
  user: UserProfile,
  callbacks: CheckoutCallbacks = {},
  returnContext?: Partial<PaymentReturnContext>
): Promise<StartPaymentResult> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before purchasing a Fast Connection Pass." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();
  callbacks.onPhase?.("preparing");

  try {
    await fetchSubscriptionCatalog();
    const amount = fastConnectionWeeklyAmount() || undefined;
    const days = quickiePassDays();
    const paymentReturnContext = buildReturnContext("quickie", "fast-connection-pass", returnContext);

    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize-quickie"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      amount,
      days,
      platform: paymentPlatform(),
      returnPath: paymentReturnContext.returnPath,
      sourcePage: paymentReturnContext.sourcePage,
      productType: paymentReturnContext.productType,
      productId: paymentReturnContext.productId
    });

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    callbacks.onPhase?.("opening");
    return await launchCheckout(init, "quickie", undefined, paymentReturnContext);
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export async function verifyQuickiePayment(user: UserProfile): Promise<{
  ok: boolean;
  error?: string;
  pending?: boolean;
  quickiePassUntil?: string;
} & VerifyResult> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const returnBody = currentPaymentReturnBody();
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name,
        ...returnBody,
        productType: "quickie"
      })
    });
    const payload = await readResponseJson<VerifyPaymentPayload>(response);
    if (response.status === 402) {
      return { ok: false, pending: true, error: payload?.error || "Payment not completed." };
    }
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    return {
      ok: true,
      quickiePassUntil: payload.quickiePassUntil || payload.fastConnectionPassUntil,
      productType: normalizePaymentKind(payload.productType),
      productId: payload.productId,
      returnPath: payload.returnPath,
      sourcePage: payload.sourcePage,
      premiumUntil: payload.premium_until,
      boostId: payload.boostId,
      expiresAt: payload.expiresAt
    };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startBoostPayment(
  boostId: string,
  price: number,
  user: UserProfile,
  city: string,
  durationHours = 48,
  callbacks: CheckoutCallbacks = {},
  returnContext?: Partial<PaymentReturnContext>
): Promise<StartPaymentResult> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before purchasing a boost." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();
  callbacks.onPhase?.("preparing");

  try {
    const paymentReturnContext = buildReturnContext("boost", boostId, returnContext, "/profile");
    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize-boost"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      boostId,
      city,
      amount: price,
      durationHours,
      platform: paymentPlatform(),
      returnPath: paymentReturnContext.returnPath,
      sourcePage: paymentReturnContext.sourcePage,
      productType: paymentReturnContext.productType,
      productId: paymentReturnContext.productId
    });

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    callbacks.onPhase?.("opening");
    return await launchCheckout(
      init,
      "boost",
      {
        [STORAGE_KEYS.paymentBoostId]: boostId
      },
      paymentReturnContext
    );
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export async function verifyBoostPayment(
  user: UserProfile,
  boostId = "city-boost",
  city?: string
): Promise<{ ok: boolean; error?: string; expiresAt?: string; pending?: boolean } & VerifyResult> {
  const resolvedCity = city?.trim() || getMemberCity();
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const returnBody = currentPaymentReturnBody();
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name,
        ...returnBody,
        productType: "boost",
        boostId,
        city: resolvedCity
      })
    });
    const payload = await readResponseJson<VerifyPaymentPayload>(response);
    if (response.status === 402) {
      return { ok: false, pending: true, error: payload?.error || "Payment not completed." };
    }
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    return {
      ok: true,
      expiresAt: payload.expiresAt,
      productType: normalizePaymentKind(payload.productType),
      productId: payload.productId,
      returnPath: payload.returnPath,
      sourcePage: payload.sourcePage,
      boostId: payload.boostId || boostId,
      premiumUntil: payload.premium_until,
      quickiePassUntil: payload.quickiePassUntil || payload.fastConnectionPassUntil
    };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function completePendingPayment(user: UserProfile): Promise<{
  ok: boolean;
  kind: PaymentKind;
  error?: string;
  pending?: boolean;
  cancelled?: boolean;
  productId?: string;
  returnPath?: string;
  sourcePage?: string;
  boostId?: string;
  quickiePassUntil?: string;
  premiumUntil?: string;
  expiresAt?: string;
}> {
  const params = new URLSearchParams(window.location.search);
  const urlStatus = params.get("status")?.trim().toLowerCase();
  const reference =
    params.get("trxref") ||
    params.get("reference") ||
    localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  const meta = getPaymentReturnMeta();
  const storedKind = normalizePaymentKind(localStorage.getItem(STORAGE_KEYS.paymentKind) || meta.productType);

  if (urlStatus === "cancelled" || urlStatus === "canceled") {
    logPaymentEvent("verification result", { reference, ok: false, kind: storedKind, cancelled: true });
    return { ok: false, kind: storedKind, cancelled: true };
  }

  if (!reference) {
    return { ok: false, kind: storedKind, error: "No payment reference." };
  }

  localStorage.setItem(STORAGE_KEYS.paymentReference, reference);
  setPaymentFlowState("verifying");
  logPaymentEvent("verification started", { reference });

  if (urlStatus === "failed") {
    logPaymentEvent("verification result", { reference, ok: false, kind: storedKind, status: "failed" });
    if (checkoutWasOpened()) {
      setPaymentFlowState("failed");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, kind: storedKind, error: "Payment was not completed." };
  }

  if (storedKind === "boost") {
    const datingProfile = readJson<{ city?: string }>(STORAGE_KEYS.datingProfile, {});
    const boostId = localStorage.getItem(STORAGE_KEYS.paymentBoostId) || "city-boost";
    const result = await verifyBoostPayment(user, boostId, datingProfile.city || getMemberCity());
    if (result.ok) {
      const kind = normalizePaymentKind(result.productType || "boost");
      if (kind === "quickie" && result.quickiePassUntil) {
        activateQuickiePass(result.quickiePassUntil);
      }
      logPaymentEvent("verification result", { reference, ok: true, kind });
      return {
        ok: true,
        kind,
        productId: result.productId,
        returnPath: result.returnPath,
        sourcePage: result.sourcePage,
        boostId: result.boostId || boostId,
        quickiePassUntil: result.quickiePassUntil,
        premiumUntil: result.premiumUntil,
        expiresAt: result.expiresAt
      };
    }
    if (result.pending) return { ok: false, kind: "boost", pending: true };
    logPaymentEvent("verification result", { reference, ok: false, kind: "boost", error: result.error });
    if (checkoutWasOpened()) {
      setPaymentFlowState("failed");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, kind: "boost", error: result.error };
  }

  if (storedKind === "quickie") {
    const result = await verifyQuickiePayment(user);
    if (result.ok) {
      if (result.quickiePassUntil) {
        activateQuickiePass(result.quickiePassUntil);
      }
      const kind = normalizePaymentKind(result.productType || "quickie");
      logPaymentEvent("verification result", { reference, ok: true, kind });
      return {
        ok: true,
        kind,
        productId: result.productId,
        returnPath: result.returnPath,
        sourcePage: result.sourcePage,
        boostId: result.boostId,
        quickiePassUntil: result.quickiePassUntil,
        premiumUntil: result.premiumUntil,
        expiresAt: result.expiresAt
      };
    }
    if (result.pending) return { ok: false, kind: "quickie", pending: true };
    logPaymentEvent("verification result", { reference, ok: false, kind: "quickie", error: result.error });
    if (checkoutWasOpened()) {
      setPaymentFlowState("failed");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, kind: "quickie", error: result.error };
  }

  const result = await verifyPayment(user);
  if (result.ok) {
    const kind = normalizePaymentKind(result.productType || "premium");
    if (kind === "quickie" && result.quickiePassUntil) {
      activateQuickiePass(result.quickiePassUntil);
    }
    logPaymentEvent("verification result", { reference, ok: true, kind });
    return {
      ok: true,
      kind,
      productId: result.productId,
      returnPath: result.returnPath,
      sourcePage: result.sourcePage,
      boostId: result.boostId,
      quickiePassUntil: result.quickiePassUntil,
      premiumUntil: result.premiumUntil,
      expiresAt: result.expiresAt
    };
  }
  if (result.pending) return { ok: false, kind: "premium", pending: true };
  logPaymentEvent("verification result", { reference, ok: false, kind: "premium", error: result.error });
  if (checkoutWasOpened()) {
    setPaymentFlowState("failed");
  } else {
    setPaymentFlowState("idle");
  }
  return { ok: false, kind: "premium", error: result.error };
}
