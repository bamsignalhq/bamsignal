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
import { activateQuickiePass } from "../utils/quickie";
import { applyQuickieIntentAfterPayment } from "../utils/fastConnectionIntent";
import { fetchSubscriptionCatalog } from "./subscriptionCatalog";
import { memberApiHeaders } from "../utils/memberApiAuth";
import {
  interpretVerifyHttpResponse,
  type PaymentReturnKind,
  type PaymentReturnOutcome
} from "../utils/paymentReturnStatus";

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

type PaymentKind = "premium" | "boost" | "quickie" | "conversation_unlock" | "discreet" | "concierge_invoice";

type VerifyPaymentPayload = {
  ok?: boolean;
  error?: string;
  productType?: PaymentKind | string;
  productId?: string;
  returnPath?: string;
  sourcePage?: string;
  premium_until?: string;
  quickiePassUntil?: string;
  fastConnectionPassUntil?: string;
  boostId?: string;
  expiresAt?: string;
  entitlementId?: string;
  boostActive?: boolean;
  matchId?: string;
  targetProfileId?: string;
  unlock?: { id?: string; match_id?: string | null } | null;
  discreetUntil?: string;
  invoiceId?: string;
  boost?: {
    id?: string;
    productId?: string;
    activatedAt?: string | null;
    expiresAt?: string | null;
    consumed?: boolean;
    city?: string;
    memberDiscoverId?: string;
  };
};

type VerifyResult = {
  ok: boolean;
  error?: string;
  pending?: boolean;
  retryable?: boolean;
  productType?: PaymentKind;
  productId?: string;
  returnPath?: string;
  sourcePage?: string;
  premiumUntil?: string;
  quickiePassUntil?: string;
  boostId?: string;
  expiresAt?: string;
  entitlementId?: string;
  boost?: VerifyPaymentPayload["boost"];
};

function normalizePaymentKind(kind?: string | null): PaymentKind {
  if (kind === "fast_connection") return "quickie";
  if (kind === "conversation_unlock" || kind === "conversation-unlock") return "conversation_unlock";
  if (kind === "discreet" || kind === "discreet_membership") return "discreet";
  if (kind === "concierge_invoice" || kind === "concierge-invoice") return "concierge_invoice";
  return kind === "boost" || kind === "quickie" || kind === "premium" ? kind : "premium";
}

function parseVerifyHttpResult(
  response: Response,
  payload: VerifyPaymentPayload | null | undefined,
  fallbackError: string,
  kind: PaymentReturnKind = "premium"
): { ok: true; payload: VerifyPaymentPayload } | { ok: false; error: string; pending?: boolean; retryable?: boolean } {
  const outcome = interpretVerifyHttpResponse(response, payload, kind, fallbackError);
  if (outcome.status === "fulfilled") {
    return { ok: true, payload: payload || { ok: true } };
  }
  if (outcome.status === "pending") {
    return { ok: false, pending: true, error: outcome.error || "Payment not completed." };
  }
  if (outcome.status === "processing") {
    return { ok: false, retryable: true, error: outcome.error || "Payment processing." };
  }
  if (outcome.status === "cancelled") {
    return { ok: false, error: "Payment was cancelled." };
  }
  return { ok: false, error: outcome.error || fallbackError };
}

export function toVerifyResultFromOutcome(outcome: PaymentReturnOutcome): {
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
} {
  if (outcome.status === "fulfilled") {
    return {
      ok: true,
      kind: outcome.kind,
      productId: outcome.productId,
      returnPath: outcome.returnPath,
      sourcePage: outcome.sourcePage,
      boostId: outcome.boostId,
      quickiePassUntil: outcome.quickiePassUntil,
      premiumUntil: outcome.premiumUntil,
      expiresAt: outcome.expiresAt
    };
  }
  if (outcome.status === "cancelled") {
    return { ok: false, kind: outcome.kind, cancelled: true };
  }
  if (outcome.status === "pending" || outcome.status === "processing") {
    return { ok: false, kind: outcome.kind, pending: true, error: outcome.error || "Payment pending." };
  }
  return { ok: false, kind: outcome.kind, error: outcome.error || "Payment not verified yet." };
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
    productType: (returnContext?.productType as PaymentReturnContext["productType"]) || kind,
    productId: returnContext?.productId || productId,
    sourcePage: normalizePaymentReturnPath(returnContext?.sourcePage || returnPath)
  };
}

async function postInitialize(url: string, body: Record<string, unknown>): Promise<InitPayload> {
  const started = typeof performance !== "undefined" ? performance.now() : 0;
  const response = await fetch(url, {
    method: "POST",
    headers: await memberApiHeaders(),
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
      productId: plan.id,
      platform: paymentPlatform(),
      returnPath: paymentReturnContext.returnPath,
      sourcePage: paymentReturnContext.sourcePage
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
    const parsed = parseVerifyHttpResult(response, payload, "Payment not verified yet.", "premium");
    if (!parsed.ok) {
      return parsed;
    }
    const verified = parsed.payload;
    const kind = normalizePaymentKind(verified.productType);
    if (kind === "premium" && verified.premium_until) {
      setPremiumSnapshot({ isPremium: true, premiumUntil: verified.premium_until });
    }
    return {
      ok: true,
      premiumUntil: verified.premium_until,
      productType: normalizePaymentKind(verified.productType),
      productId: verified.productId,
      returnPath: verified.returnPath,
      sourcePage: verified.sourcePage,
      quickiePassUntil: verified.quickiePassUntil || verified.fastConnectionPassUntil,
      boostId: verified.boostId,
      expiresAt: verified.expiresAt,
      entitlementId: verified.entitlementId || verified.boost?.id,
      boost: verified.boost
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
    const paymentReturnContext = buildReturnContext("quickie", "fast-connection-pass", returnContext);

    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize-quickie"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      productId: "fast-connection-pass",
      platform: paymentPlatform(),
      returnPath: paymentReturnContext.returnPath,
      sourcePage: paymentReturnContext.sourcePage,
      productType: paymentReturnContext.productType
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

export async function startFastConnectionActivationPayment(
  user: UserProfile,
  callbacks: CheckoutCallbacks = {}
): Promise<StartPaymentResult> {
  return startQuickiePassPayment(user, callbacks, {
    returnPath: "/fast-connection",
    sourcePage: "/home",
    productType: "fast_connection",
    productId: "fast-connection-pass"
  });
}

export async function startFastConnectionRenewalPayment(
  user: UserProfile,
  callbacks: CheckoutCallbacks = {}
): Promise<StartPaymentResult> {
  return startQuickiePassPayment(user, callbacks, {
    returnPath: "/fast-connection",
    sourcePage: "/fast-connection",
    productType: "fast_connection",
    productId: "fast-connection-pass"
  });
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
        productType: returnBody.productType === "fast_connection" ? "fast_connection" : "quickie"
      })
    });
    const payload = await readResponseJson<VerifyPaymentPayload>(response);
    const parsed = parseVerifyHttpResult(response, payload, "Payment not verified yet.", "quickie");
    if (!parsed.ok) {
      return parsed;
    }
    const verified = parsed.payload;
    return {
      ok: true,
      quickiePassUntil: verified.quickiePassUntil || verified.fastConnectionPassUntil,
      productType: normalizePaymentKind(verified.productType),
      productId: verified.productId,
      returnPath: verified.returnPath,
      sourcePage: verified.sourcePage,
      premiumUntil: verified.premium_until,
      boostId: verified.boostId,
      expiresAt: verified.expiresAt,
      entitlementId: verified.entitlementId || verified.boost?.id,
      boost: verified.boost
    };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startBoostPayment(
  boostId: string,
  user: UserProfile,
  city: string,
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
      productId: boostId,
      city,
      platform: paymentPlatform(),
      returnPath: paymentReturnContext.returnPath,
      sourcePage: paymentReturnContext.sourcePage
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
    const parsed = parseVerifyHttpResult(response, payload, "Payment not verified yet.", "boost");
    if (!parsed.ok) {
      return parsed;
    }
    const verified = parsed.payload;
    return {
      ok: true,
      expiresAt: verified.expiresAt,
      productType: normalizePaymentKind(verified.productType),
      productId: verified.productId,
      returnPath: verified.returnPath,
      sourcePage: verified.sourcePage,
      boostId: verified.boostId || boostId,
      premiumUntil: verified.premium_until,
      quickiePassUntil: verified.quickiePassUntil || verified.fastConnectionPassUntil
    };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startDiscreetPayment(
  user: UserProfile,
  callbacks: CheckoutCallbacks = {},
  returnContext?: Partial<PaymentReturnContext>,
  planId = "monthly"
): Promise<StartPaymentResult> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before purchasing Discreet Membership." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();
  callbacks.onPhase?.("preparing");

  try {
    const paymentReturnContext = buildReturnContext(
      "discreet",
      planId,
      returnContext,
      "/discreet-membership"
    );
    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      productType: "discreet",
      productId: planId,
      plan: planId,
      platform: paymentPlatform(),
      returnPath: paymentReturnContext.returnPath,
      sourcePage: paymentReturnContext.sourcePage
    });

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    callbacks.onPhase?.("opening");
    return await launchCheckout(init, "discreet", undefined, paymentReturnContext);
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export async function verifyDiscreetPayment(
  user: UserProfile
): Promise<
  {
    ok: boolean;
    error?: string;
    pending?: boolean;
    retryable?: boolean;
    discreetUntil?: string;
  } & VerifyResult
> {
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
        productType: "discreet",
        productId: returnBody.productId || "monthly"
      })
    });
    const payload = await readResponseJson<VerifyPaymentPayload>(response);
    const parsed = parseVerifyHttpResult(response, payload, "Payment not verified yet.", "discreet");
    if (!parsed.ok) {
      return parsed;
    }
    const verified = parsed.payload;
    return {
      ok: true,
      productType: normalizePaymentKind(verified.productType),
      productId: verified.productId,
      returnPath: verified.returnPath,
      sourcePage: verified.sourcePage,
      discreetUntil: verified.discreetUntil
    };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startConversationUnlockPayment(
  targetProfileId: string,
  user: UserProfile,
  callbacks: CheckoutCallbacks = {},
  returnContext?: Partial<PaymentReturnContext>
): Promise<StartPaymentResult> {
  const targetId = String(targetProfileId || "").trim();
  if (!user.email) {
    return { ok: false, error: "Add a verified email before unlocking a conversation." };
  }
  if (!targetId) {
    return { ok: false, error: "Choose a profile to unlock." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();
  callbacks.onPhase?.("preparing");

  try {
    const paymentReturnContext = buildReturnContext(
      "conversation_unlock",
      "conversation-unlock",
      returnContext,
      "/chats"
    );
    const init = await postInitialize(
      apiUrl("/api/paystack/verify?action=initialize-conversation-unlock"),
      {
        email: user.email,
        phone: user.phone,
        name: user.name,
        productType: "conversation_unlock",
        productId: "conversation-unlock",
        targetProfileId: targetId,
        platform: paymentPlatform(),
        returnPath: paymentReturnContext.returnPath,
        sourcePage: paymentReturnContext.sourcePage
      }
    );

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    callbacks.onPhase?.("opening");
    return await launchCheckout(
      init,
      "conversation_unlock",
      {
        [STORAGE_KEYS.paymentUnlockTargetId]: targetId
      },
      paymentReturnContext
    );
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export async function verifyConversationUnlockPayment(
  user: UserProfile,
  targetProfileId?: string
): Promise<
  {
    ok: boolean;
    error?: string;
    pending?: boolean;
    retryable?: boolean;
    matchId?: string;
    targetProfileId?: string;
  } & VerifyResult
> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }
  const targetId =
    String(targetProfileId || localStorage.getItem(STORAGE_KEYS.paymentUnlockTargetId) || "").trim();

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
        productType: "conversation_unlock",
        productId: "conversation-unlock",
        targetProfileId: targetId
      })
    });
    const payload = await readResponseJson<VerifyPaymentPayload>(response);
    const parsed = parseVerifyHttpResult(
      response,
      payload,
      "Payment not verified yet.",
      "conversation_unlock"
    );
    if (!parsed.ok) {
      return parsed;
    }
    const verified = parsed.payload;
    return {
      ok: true,
      productType: normalizePaymentKind(verified.productType),
      productId: verified.productId,
      returnPath: verified.returnPath,
      sourcePage: verified.sourcePage,
      matchId: verified.matchId,
      targetProfileId: verified.targetProfileId || targetId
    };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startConciergeInvoicePayment(
  invoiceId: string,
  user: UserProfile,
  callbacks: CheckoutCallbacks = {},
  returnContext?: Partial<PaymentReturnContext>
): Promise<StartPaymentResult> {
  const id = String(invoiceId || "").trim();
  if (!user.email) {
    return { ok: false, error: "Add a verified email before paying a Concierge invoice." };
  }
  if (!id) {
    return { ok: false, error: "Choose an invoice to pay." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();
  callbacks.onPhase?.("preparing");

  try {
    const paymentReturnContext = buildReturnContext(
      "concierge_invoice",
      id,
      returnContext,
      "/signal-concierge/invoices"
    );
    const init = await postInitialize(
      apiUrl("/api/paystack/verify?action=initialize-concierge-invoice"),
      {
        email: user.email,
        phone: user.phone,
        name: user.name,
        productType: "concierge_invoice",
        productId: id,
        invoiceId: id,
        platform: paymentPlatform(),
        returnPath: paymentReturnContext.returnPath,
        sourcePage: paymentReturnContext.sourcePage
      }
    );

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    callbacks.onPhase?.("opening");
    return await launchCheckout(init, "concierge_invoice", {}, paymentReturnContext);
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export async function verifyConciergeInvoicePayment(
  user: UserProfile,
  invoiceId?: string
): Promise<
  {
    ok: boolean;
    error?: string;
    pending?: boolean;
    retryable?: boolean;
    invoiceId?: string;
    grantsMembership?: boolean;
  } & VerifyResult
> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }
  const id = String(invoiceId || "").trim();

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
        productType: "concierge_invoice",
        productId: id || undefined,
        invoiceId: id || undefined
      })
    });
    const payload = await readResponseJson<VerifyPaymentPayload & { invoiceId?: string; grantsMembership?: boolean }>(
      response
    );
    const parsed = parseVerifyHttpResult(
      response,
      payload,
      "Payment not verified yet.",
      "concierge_invoice"
    );
    if (!parsed.ok) {
      return parsed;
    }
    const verified = parsed.payload;
    return {
      ok: true,
      productType: normalizePaymentKind(verified.productType),
      productId: verified.productId,
      returnPath: verified.returnPath,
      sourcePage: verified.sourcePage,
      invoiceId: verified.invoiceId || id,
      grantsMembership: false
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
  matchId?: string;
  targetProfileId?: string;
  discreetUntil?: string;
  invoiceId?: string;
  entitlementId?: string;
  boost?: VerifyPaymentPayload["boost"];
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
        expiresAt: result.expiresAt,
        entitlementId: result.entitlementId,
        boost: result.boost
      };
    }
    if (result.pending || result.retryable) {
      return { ok: false, kind: "boost", pending: true, error: result.error };
    }
    logPaymentEvent("verification result", { reference, ok: false, kind: "boost", error: result.error });
    if (checkoutWasOpened()) {
      setPaymentFlowState("failed");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, kind: "boost", error: result.error };
  }

  if (storedKind === "conversation_unlock") {
    const result = await verifyConversationUnlockPayment(user);
    if (result.ok) {
      logPaymentEvent("verification result", {
        reference,
        ok: true,
        kind: "conversation_unlock"
      });
      return {
        ok: true,
        kind: "conversation_unlock",
        productId: result.productId || "conversation-unlock",
        returnPath: result.returnPath,
        sourcePage: result.sourcePage,
        matchId: result.matchId,
        targetProfileId: result.targetProfileId
      };
    }
    if (result.pending || result.retryable) {
      return { ok: false, kind: "conversation_unlock", pending: true, error: result.error };
    }
    logPaymentEvent("verification result", {
      reference,
      ok: false,
      kind: "conversation_unlock",
      error: result.error
    });
    if (checkoutWasOpened()) {
      setPaymentFlowState("failed");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, kind: "conversation_unlock", error: result.error };
  }

  if (storedKind === "concierge_invoice") {
    const result = await verifyConciergeInvoicePayment(user);
    if (result.ok) {
      logPaymentEvent("verification result", {
        reference,
        ok: true,
        kind: "concierge_invoice"
      });
      return {
        ok: true,
        kind: "concierge_invoice",
        productId: result.productId,
        returnPath: result.returnPath || "/signal-concierge/invoices",
        sourcePage: result.sourcePage,
        invoiceId: result.invoiceId
      };
    }
    if (result.pending || result.retryable) {
      return { ok: false, kind: "concierge_invoice", pending: true, error: result.error };
    }
    logPaymentEvent("verification result", {
      reference,
      ok: false,
      kind: "concierge_invoice",
      error: result.error
    });
    if (checkoutWasOpened()) {
      setPaymentFlowState("failed");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, kind: "concierge_invoice", error: result.error };
  }

  if (storedKind === "discreet") {
    const result = await verifyDiscreetPayment(user);
    if (result.ok) {
      logPaymentEvent("verification result", { reference, ok: true, kind: "discreet" });
      return {
        ok: true,
        kind: "discreet",
        productId: result.productId || "monthly",
        returnPath: result.returnPath,
        sourcePage: result.sourcePage,
        discreetUntil: result.discreetUntil
      };
    }
    if (result.pending || result.retryable) {
      return { ok: false, kind: "discreet", pending: true, error: result.error };
    }
    logPaymentEvent("verification result", { reference, ok: false, kind: "discreet", error: result.error });
    if (checkoutWasOpened()) {
      setPaymentFlowState("failed");
    } else {
      setPaymentFlowState("idle");
    }
    return { ok: false, kind: "discreet", error: result.error };
  }

  if (storedKind === "quickie") {
    const result = await verifyQuickiePayment(user);
    if (result.ok) {
      applyQuickieIntentAfterPayment(user, result.quickiePassUntil);
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
    if (result.pending || result.retryable) {
      return { ok: false, kind: "quickie", pending: true, error: result.error };
    }
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
  if (result.pending || result.retryable) {
    return { ok: false, kind: "premium", pending: true, error: result.error };
  }
  logPaymentEvent("verification result", { reference, ok: false, kind: "premium", error: result.error });
  if (checkoutWasOpened()) {
    setPaymentFlowState("failed");
  } else {
    setPaymentFlowState("idle");
  }
  return { ok: false, kind: "premium", error: result.error };
}
