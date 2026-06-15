import { Capacitor } from "@capacitor/core";
import type { PremiumPlan } from "../constants/plans";
import { DEFAULT_PREMIUM_PLANS } from "../constants/plans";
import { STORAGE_KEYS } from "../constants/limits";
import type { UserProfile } from "../types";
import { readJson } from "../utils/storage";
import {
  beginPaymentSession,
  checkoutWasOpened,
  logPaymentEvent,
  markPaymentSessionStarted,
  setPaymentFlowState
} from "../utils/paymentState";
import { PAYMENT_START_ERROR } from "../config/paystack";
import { openPaystackCheckout } from "./paymentCheckout";
import { apiUrl } from "./supabase";
import { setPremiumSnapshot, isPremiumActive, refreshPremiumStatus } from "./premiumStatus";

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

async function postInitialize(url: string, body: Record<string, unknown>): Promise<InitPayload> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok || !payload.authorization_url) {
    logPaymentEvent("initialize failed", { url, error: payload?.error });
    return { ok: false, error: payload?.error || INIT_ERROR };
  }
  logPaymentEvent("payment initialized", {
    reference: payload.reference,
    hasAccessCode: Boolean(payload.access_code)
  });
  return payload as InitPayload;
}

async function launchCheckout(
  init: InitPayload,
  kind: string,
  extraKeys?: Record<string, string>
): Promise<StartPaymentResult> {
  if (!init.reference) {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }

  localStorage.setItem(STORAGE_KEYS.paymentKind, kind);
  if (extraKeys) {
    for (const [key, value] of Object.entries(extraKeys)) {
      localStorage.setItem(key, value);
    }
  }

  const outcome = await openPaystackCheckout({
    authorizationUrl: init.authorization_url!,
    accessCode: init.access_code,
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

export async function startPlanPayment(plan: PremiumPlan, user: UserProfile): Promise<StartPaymentResult> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before upgrading." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();

  try {
    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      days: plan.days,
      amount: plan.price,
      plan: plan.id,
      platform: paymentPlatform()
    });

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    return await launchCheckout(init, "premium");
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export function startWeeklyPassPayment(user: UserProfile, plans = DEFAULT_PREMIUM_PLANS) {
  const plan = plans.find((p) => p.id === "weekly") || plans[0];
  return startPlanPayment(plan, user);
}

export function startMonthlyPassPayment(user: UserProfile, plans = DEFAULT_PREMIUM_PLANS) {
  const plan = plans.find((p) => p.id === "monthly") || plans[1] || plans[0];
  return startPlanPayment(plan, user);
}

export function startQuarterlyPassPayment(user: UserProfile, plans = DEFAULT_PREMIUM_PLANS) {
  const plan = plans.find((p) => p.id === "quarterly") || plans[2] || plans[0];
  return startPlanPayment(plan, user);
}

export async function verifyPayment(user: UserProfile): Promise<{
  ok: boolean;
  premiumUntil?: string;
  error?: string;
  pending?: boolean;
}> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name
      })
    });
    const payload = await response.json().catch(() => null);
    if (response.status === 402) {
      return { ok: false, pending: true, error: payload?.error || "Payment not completed." };
    }
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    if (payload.premium_until) {
      setPremiumSnapshot({ isPremium: true, premiumUntil: payload.premium_until });
    }
    return { ok: true, premiumUntil: payload.premium_until };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startQuickiePassPayment(user: UserProfile): Promise<StartPaymentResult> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before purchasing a Quickie pass." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();

  try {
    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize-quickie"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      amount: 999,
      platform: paymentPlatform()
    });

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    return await launchCheckout(init, "quickie");
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export async function verifyQuickiePayment(user: UserProfile): Promise<{
  ok: boolean;
  error?: string;
  pending?: boolean;
}> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name,
        productType: "quickie"
      })
    });
    const payload = await response.json().catch(() => null);
    if (response.status === 402) {
      return { ok: false, pending: true, error: payload?.error || "Payment not completed." };
    }
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function startBoostPayment(
  boostId: string,
  price: number,
  user: UserProfile,
  city: string,
  durationHours = 48
): Promise<StartPaymentResult> {
  if (!user.email) {
    return { ok: false, error: "Add a verified email before purchasing a boost." };
  }

  beginPaymentSession();
  markPaymentSessionStarted();

  try {
    const init = await postInitialize(apiUrl("/api/paystack/verify?action=initialize-boost"), {
      email: user.email,
      phone: user.phone,
      name: user.name,
      boostId,
      city,
      amount: price,
      durationHours,
      platform: paymentPlatform()
    });

    if (!init.ok) {
      setPaymentFlowState("idle");
      return { ok: false, error: init.error || INIT_ERROR };
    }

    return await launchCheckout(init, "boost", {
      [STORAGE_KEYS.paymentBoostId]: boostId
    });
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: INIT_ERROR };
  }
}

export async function verifyBoostPayment(
  user: UserProfile,
  boostId = "city-boost",
  city = "Lagos"
): Promise<{ ok: boolean; error?: string; expiresAt?: string; pending?: boolean }> {
  const reference = localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();
  if (!reference) {
    return { ok: false, error: "No payment reference found." };
  }

  try {
    const response = await fetch(apiUrl("/api/paystack/verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        email: user.email,
        phone: user.phone,
        name: user.name,
        productType: "boost",
        boostId,
        city
      })
    });
    const payload = await response.json().catch(() => null);
    if (response.status === 402) {
      return { ok: false, pending: true, error: payload?.error || "Payment not completed." };
    }
    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Payment not verified yet." };
    }
    return { ok: true, expiresAt: payload.expiresAt };
  } catch {
    return { ok: false, error: "Verification failed." };
  }
}

export async function completePendingPayment(user: UserProfile): Promise<{
  ok: boolean;
  kind: "premium" | "boost" | "quickie";
  error?: string;
  pending?: boolean;
  cancelled?: boolean;
}> {
  const reference =
    new URLSearchParams(window.location.search).get("trxref") ||
    new URLSearchParams(window.location.search).get("reference") ||
    localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim();

  if (!reference) {
    return { ok: false, kind: "premium", error: "No payment reference." };
  }

  localStorage.setItem(STORAGE_KEYS.paymentReference, reference);
  setPaymentFlowState("verifying");
  logPaymentEvent("verification started", { reference });

  const kind = (localStorage.getItem(STORAGE_KEYS.paymentKind) || "premium") as
    | "premium"
    | "boost"
    | "quickie";

  if (kind === "boost") {
    const datingProfile = readJson<{ city?: string }>(STORAGE_KEYS.datingProfile, {});
    const boostId = localStorage.getItem(STORAGE_KEYS.paymentBoostId) || "city-boost";
    const result = await verifyBoostPayment(user, boostId, datingProfile.city || "Lagos");
    if (result.ok) {
      logPaymentEvent("verification result", { reference, ok: true, kind: "boost" });
      return { ok: true, kind: "boost" };
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

  if (kind === "quickie") {
    const result = await verifyQuickiePayment(user);
    if (result.ok) {
      logPaymentEvent("verification result", { reference, ok: true, kind: "quickie" });
      return { ok: true, kind: "quickie" };
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
    logPaymentEvent("verification result", { reference, ok: true, kind: "premium" });
    return { ok: true, kind: "premium" };
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
