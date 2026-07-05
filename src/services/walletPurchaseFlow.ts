import { Capacitor } from "@capacitor/core";
import { STORAGE_KEYS } from "../constants/limits";
import type { BoostProductId } from "../constants/boosts";
import type { PremiumPlan } from "../constants/plans";
import { PAYMENT_START_ERROR } from "../config/paystack";
import { openPaystackCheckout } from "./paymentCheckout";
import type { UserProfile } from "../types";
import { apiUrl } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import {
  purchaseThroughWallet,
  type WalletGateEntry,
  type WalletGateResult
} from "./walletExperience";
import {
  beginPaymentSession,
  logPaymentEvent,
  markPaymentSessionStarted,
  setPaymentFlowState
} from "../utils/paymentState";
import { savePaymentReturnContext } from "../utils/paymentReturn";
import { readResponseJson } from "../utils/httpJson";

const WALLET_RESUME_KEY = "bamsignal_wallet_resume_token";

export type WalletPurchaseContext = {
  entry: WalletGateEntry | string;
  productId?: string;
  productLabel?: string;
  returnPath?: string;
};

export function boostIdToWalletEntry(boostId: BoostProductId): WalletGateEntry | string {
  switch (boostId) {
    case "priority-signal-once":
      return "priority";
    case "profile-boost":
      return "super_boost";
    case "signal-boost":
    default:
      return "boost";
  }
}

export function premiumPlanToWalletContext(plan: PremiumPlan): WalletPurchaseContext {
  return {
    entry: "premium",
    productId: "premium-monthly",
    productLabel: plan.name || "Premium"
  };
}

export function storeWalletResumeToken(resumeToken: string) {
  localStorage.setItem(WALLET_RESUME_KEY, resumeToken);
}

export function readWalletResumeToken(): string | null {
  return localStorage.getItem(WALLET_RESUME_KEY)?.trim() || null;
}

export function clearWalletResumeToken() {
  localStorage.removeItem(WALLET_RESUME_KEY);
}

export async function executeWalletPurchase(
  ctx: WalletPurchaseContext
): Promise<{ ok: boolean; gate?: WalletGateResult; error?: string }> {
  const result = await purchaseThroughWallet({
    entry: ctx.entry,
    productId: ctx.productId,
    idempotencyKey: `wallet:${ctx.entry}:${ctx.productId ?? "default"}`
  });

  if (!result.gate) {
    return { ok: false, error: result.error || "Wallet purchase unavailable." };
  }

  if (result.gate.resumeToken) {
    storeWalletResumeToken(result.gate.resumeToken);
  }

  return { ok: Boolean(result.ok && result.gate.ok), gate: result.gate, error: result.gate.error };
}

function paymentPlatform(): "native" | "web" {
  return Capacitor.isNativePlatform() ? "native" : "web";
}

type BayGoldInitPayload = {
  ok: boolean;
  error?: string;
  reference?: string;
  authorization_url?: string;
};

export async function startBayGoldFunding(input: {
  resumeToken?: string;
  shortfallBayGold?: number;
  returnPath?: string;
}): Promise<{ ok: boolean; error?: string; reference?: string; needsVerify?: boolean; cancelled?: boolean }> {
  if (input.resumeToken) {
    storeWalletResumeToken(input.resumeToken);
  }

  beginPaymentSession();
  markPaymentSessionStarted();
  setPaymentFlowState("preparing");

  const returnPath = input.returnPath || "/home";

  try {
    const response = await fetch(apiUrl("/api/wallet"), {
      method: "POST",
      headers: await memberApiHeaders(),
      body: JSON.stringify({
        action: "initialize-funding",
        resumeToken: input.resumeToken || readWalletResumeToken(),
        shortfallBayGold: input.shortfallBayGold,
        returnPath,
        platform: paymentPlatform()
      })
    });
    const init = await readResponseJson<BayGoldInitPayload>(response);

    if (!response.ok || !init?.ok || !init.authorization_url || !init.reference) {
      setPaymentFlowState("idle");
      return { ok: false, error: init?.error || PAYMENT_START_ERROR };
    }

    savePaymentReturnContext({
      returnPath,
      productType: "wallet_funding",
      productId: "baygold",
      sourcePage: returnPath,
      reference: init.reference
    });
    localStorage.setItem(STORAGE_KEYS.paymentKind, "wallet_funding");
    localStorage.setItem(STORAGE_KEYS.paymentReference, init.reference);

    setPaymentFlowState("opening");
    const outcome = await openPaystackCheckout({
      authorizationUrl: init.authorization_url,
      reference: init.reference,
      kind: "premium"
    });

    if (outcome.status === "error") {
      setPaymentFlowState("idle");
      return { ok: false, error: outcome.message };
    }
    if (outcome.status === "cancelled") {
      setPaymentFlowState("idle");
      return { ok: false, cancelled: true };
    }
    if (outcome.status === "redirect") {
      return { ok: true, reference: init.reference };
    }

    localStorage.setItem(STORAGE_KEYS.paymentReference, outcome.reference);
    setPaymentFlowState("verifying");
    logPaymentEvent("wallet funding verification started", { reference: outcome.reference });
    return { ok: true, reference: outcome.reference, needsVerify: true };
  } catch {
    setPaymentFlowState("idle");
    return { ok: false, error: PAYMENT_START_ERROR };
  }
}

export async function completeWalletFundingReturn(
  reference: string,
  user: Pick<UserProfile, "email" | "phone" | "name"> = { email: "", phone: "", name: "" }
): Promise<{
  ok: boolean;
  error?: string;
  pending?: boolean;
  purchaseCompleted?: boolean;
}> {
  const resumeToken = readWalletResumeToken();
  if (!resumeToken) {
    return { ok: false, error: "No pending wallet purchase to resume." };
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
    const payload = await response.json();

    if (response.status === 402 || payload?.errorCode === "payment_pending") {
      return { ok: false, pending: true, error: payload?.error || "Payment pending." };
    }

    if (!response.ok || !payload?.ok) {
      return { ok: false, error: payload?.error || "Wallet funding verification failed." };
    }

    clearWalletResumeToken();
    setPaymentFlowState("idle");
    logPaymentEvent("wallet purchase resumed", { reference });
    return { ok: true, purchaseCompleted: true };
  } catch {
    return { ok: false, error: "Wallet funding verification failed." };
  }
}

export function isWalletFundingPayment(): boolean {
  return localStorage.getItem(STORAGE_KEYS.paymentKind) === "wallet_funding";
}
