import type { UserProfile } from "../types";
import { PAYMENT_CONFIRM_UNAVAILABLE } from "../config/paystack";
import { STORAGE_KEYS } from "../constants/limits";
import { logPaymentEvent } from "./paymentState";

/** Canonical client interpretation of POST /api/paystack/verify — single source of truth. */
export type PaymentReturnKind = "premium" | "boost" | "quickie" | "conversation_unlock" | "discreet" | "concierge_invoice";

export type PaymentReturnOutcome =
  | {
      status: "fulfilled";
      kind: PaymentReturnKind;
      productId?: string;
      returnPath?: string;
      sourcePage?: string;
      boostId?: string;
      quickiePassUntil?: string;
      premiumUntil?: string;
      expiresAt?: string;
      entitlementId?: string;
      boost?: VerifyPayload["boost"];
      matchId?: string;
      targetProfileId?: string;
      discreetUntil?: string;
      idempotent?: boolean;
    }
  | {
      status: "processing" | "pending";
      kind: PaymentReturnKind;
      error?: string;
      retryable: boolean;
    }
  | {
      status: "cancelled";
      kind: PaymentReturnKind;
    }
  | {
      status: "failed";
      kind: PaymentReturnKind;
      error: string;
      explicit: true;
    };

export type PaymentReturnScreenPhase = "verifying" | "processing" | "success" | "failed";

type VerifyPayload = {
  ok?: boolean;
  error?: string;
  productType?: string;
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

function normalizeKind(value?: string | null): PaymentReturnKind {
  if (value === "fast_connection") return "quickie";
  if (value === "conversation_unlock" || value === "conversation-unlock") return "conversation_unlock";
  if (value === "discreet" || value === "discreet_membership") return "discreet";
  if (value === "concierge_invoice" || value === "concierge-invoice") return "concierge_invoice";
  return value === "boost" || value === "quickie" || value === "premium" ? value : "premium";
}

/** Map verify HTTP response → canonical outcome. Never infer failure from absence of params. */
export function interpretVerifyHttpResponse(
  response: Response,
  payload: VerifyPayload | null | undefined,
  kind: PaymentReturnKind,
  fallbackError = "Payment not verified yet."
): PaymentReturnOutcome {
  if (response.status === 402) {
    return {
      status: "pending",
      kind,
      retryable: true,
      error: payload?.error || "Payment not completed."
    };
  }

  if (response.status === 503) {
    return {
      status: "processing",
      kind,
      retryable: true,
      error: payload?.error || PAYMENT_CONFIRM_UNAVAILABLE
    };
  }

  if (response.ok && payload?.ok) {
    const resolvedKind = normalizeKind(payload.productType || kind);
    if (resolvedKind === "boost" && payload.boostActive === false) {
      return {
        status: "failed",
        kind: resolvedKind,
        error: payload.error || "Boost entitlement not confirmed.",
        explicit: true
      };
    }
    return {
      status: "fulfilled",
      kind: resolvedKind,
      productId: payload.productId,
      returnPath: payload.returnPath,
      sourcePage: payload.sourcePage,
      boostId: payload.boostId,
      expiresAt: payload.expiresAt,
      premiumUntil: payload.premium_until,
      quickiePassUntil: payload.quickiePassUntil || payload.fastConnectionPassUntil,
      entitlementId: payload.entitlementId || payload.boost?.id,
      boost: payload.boost,
      matchId: payload.matchId,
      targetProfileId: payload.targetProfileId,
      discreetUntil: payload.discreetUntil,
      idempotent: payload.boostActive === undefined && !payload.entitlementId && !payload.boost?.id
    };
  }

  return {
    status: "failed",
    kind,
    error: payload?.error || fallbackError,
    explicit: true
  };
}

export function paymentReturnPhaseFromOutcome(outcome: PaymentReturnOutcome): PaymentReturnScreenPhase {
  if (outcome.status === "fulfilled") return "success";
  if (outcome.status === "processing" || outcome.status === "pending") return "processing";
  if (outcome.status === "cancelled") return "failed";
  return "failed";
}

export function isTerminalPaymentOutcome(outcome: PaymentReturnOutcome): boolean {
  return outcome.status === "fulfilled" || outcome.status === "failed" || outcome.status === "cancelled";
}

export function isSuccessfulPaymentOutcome(outcome: PaymentReturnOutcome): outcome is Extract<
  PaymentReturnOutcome,
  { status: "fulfilled" }
> {
  return outcome.status === "fulfilled";
}

export type PollPaymentOptions = {
  maxAttempts?: number;
  pendingDelayMs?: number;
  processingDelayMs?: number;
  signal?: AbortSignal;
  onPoll?: (attempt: number, outcome: PaymentReturnOutcome) => void;
};

const DEFAULT_POLL = {
  maxAttempts: 15,
  pendingDelayMs: 2000,
  processingDelayMs: 3000
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

/** Poll verify until fulfilled or explicit backend failure. */
export async function pollVerifyOutcome(
  verifyOnce: () => Promise<PaymentReturnOutcome>,
  options: PollPaymentOptions = {}
): Promise<PaymentReturnOutcome> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_POLL.maxAttempts;
  const pendingDelayMs = options.pendingDelayMs ?? DEFAULT_POLL.pendingDelayMs;
  const processingDelayMs = options.processingDelayMs ?? DEFAULT_POLL.processingDelayMs;

  let lastOutcome: PaymentReturnOutcome | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    options.signal?.throwIfAborted();
    const outcome = await verifyOnce();
    lastOutcome = outcome;
    options.onPoll?.(attempt, outcome);

    if (isTerminalPaymentOutcome(outcome)) {
      return outcome;
    }

    const delayMs = outcome.status === "processing" ? processingDelayMs : pendingDelayMs;
    logPaymentEvent("verification poll", {
      attempt,
      status: outcome.status,
      delayMs
    });
    await sleep(delayMs, options.signal);
  }

  return (
    lastOutcome || {
      status: "processing",
      kind: "premium",
      retryable: true,
      error: PAYMENT_CONFIRM_UNAVAILABLE
    }
  );
}

export function readStoredPaymentReference(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("trxref") ||
    params.get("reference") ||
    localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim() ||
    null
  );
}

export function hasRecoverablePaymentSession(): boolean {
  if (typeof window === "undefined") return false;
  const reference = readStoredPaymentReference();
  if (!reference) return false;
  const kind = localStorage.getItem(STORAGE_KEYS.paymentKind);
  return Boolean(kind || localStorage.getItem(STORAGE_KEYS.paymentProductType));
}

export function resolvePaymentIdentityFromStorage(fallback: UserProfile): UserProfile {
  if (fallback.email?.trim() || fallback.phone?.trim()) {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.userProfile);
    if (!raw) return fallback;
    const stored = JSON.parse(raw) as UserProfile;
    return {
      ...fallback,
      name: stored.name || fallback.name,
      email: stored.email || fallback.email,
      phone: stored.phone || fallback.phone
    };
  } catch {
    return fallback;
  }
}
