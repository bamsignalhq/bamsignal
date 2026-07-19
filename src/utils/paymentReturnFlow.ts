import type { UserProfile } from "../types";
import { STORAGE_KEYS } from "../constants/limits";
import { readJson } from "./storage";
import { safeUserProfile } from "./safeProfile";
import {
  hasRecoverablePaymentSession,
  isSuccessfulPaymentOutcome,
  paymentReturnPhaseFromOutcome,
  pollVerifyOutcome,
  readStoredPaymentReference,
  resolvePaymentIdentityFromStorage,
  type PaymentReturnOutcome,
  type PaymentReturnScreenPhase
} from "./paymentReturnStatus";
import { completePendingPayment as completeLegacyPendingPayment } from "../services/payments";
import {
  completeWalletFundingReturn,
  isWalletFundingPayment
} from "../services/walletPurchaseFlow";
import { logPaymentEvent, setPaymentFlowState } from "./paymentState";
import { getPaymentReturnPath } from "./paymentReturn";

export type PaymentReturnFlowResult = {
  outcome: PaymentReturnOutcome;
  phase: PaymentReturnScreenPhase;
  identity: UserProfile;
};

async function verifyOnce(user: UserProfile): Promise<PaymentReturnOutcome> {
  if (isWalletFundingPayment()) {
    const reference = readStoredPaymentReference();
    if (!reference) {
      return { status: "failed", kind: "premium", error: "No payment reference.", explicit: true };
    }
    const funded = await completeWalletFundingReturn(reference, user);
    if (funded.ok) {
      return {
        status: "fulfilled",
        kind: "premium",
        returnPath: getPaymentReturnPath() || "/home"
      };
    }
    if (funded.pending) {
      return { status: "pending", kind: "premium", retryable: true, error: funded.error };
    }
    return {
      status: "failed",
      kind: "premium",
      error: funded.error || "Wallet funding failed.",
      explicit: true
    };
  }

  const result = await completeLegacyPendingPayment(user);
  if (result.ok) {
    return {
      status: "fulfilled",
      kind: result.kind,
      productId: result.productId,
      returnPath: result.returnPath,
      sourcePage: result.sourcePage,
      boostId: result.boostId,
      quickiePassUntil: result.quickiePassUntil,
      premiumUntil: result.premiumUntil,
      expiresAt: result.expiresAt,
      entitlementId: result.entitlementId,
      boost: result.boost
    };
  }
  if (result.cancelled) {
    return { status: "cancelled", kind: result.kind };
  }
  if (result.pending) {
    return {
      status: "pending",
      kind: result.kind,
      retryable: true,
      error: result.error
    };
  }
  return {
    status: "failed",
    kind: result.kind,
    error: result.error || "Payment not verified yet.",
    explicit: true
  };
}

/** Run verify with polling — never returns failed while backend may still be processing. */
export async function runPaymentReturnVerification(
  user: UserProfile,
  options: { poll?: boolean; signal?: AbortSignal } = {}
): Promise<PaymentReturnFlowResult> {
  const identity = resolvePaymentIdentityFromStorage(user);
  const reference = readStoredPaymentReference();
  logPaymentEvent("payment return verify", { reference, email: identity.email || null });

  const outcome = options.poll
    ? await pollVerifyOutcome(() => verifyOnce(identity), { signal: options.signal })
    : await verifyOnce(identity);

  if (isSuccessfulPaymentOutcome(outcome)) {
    setPaymentFlowState("success");
  }

  return {
    outcome,
    phase: paymentReturnPhaseFromOutcome(outcome),
    identity
  };
}

export function readPaymentReturnIdentity(): UserProfile {
  const stored = readJson<UserProfile>(STORAGE_KEYS.userProfile, { name: "", email: "", phone: "" });
  return safeUserProfile(stored);
}

export function shouldAttemptPaymentRecovery(): boolean {
  return hasRecoverablePaymentSession();
}
