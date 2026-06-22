import { Capacitor } from "@capacitor/core";
import {
  CONSULTATION_PAYMENT_AMOUNT_LABEL,
  CONSULTATION_PAYMENT_FEE_LABEL,
  CONSULTATION_PAYMENTS_API_PATH
} from "../constants/consultationPayment";
import { SIGNAL_CONCIERGE_CONSULTATION_PATH } from "../constants/signalConciergeRoutes";
import { STORAGE_KEYS } from "../constants/limits";
import type { ConciergeMemberRecord } from "../types/conciergeConsultant";
import type { SignalConciergeApplication } from "../types/signalConcierge";
import { CONCIERGE_MEMBER_OWNERSHIP } from "../constants/conciergeMemberOwnership";
import { getConciergeMember } from "../utils/conciergeConsultantStore";
import { normalizeConciergeMember } from "../utils/conciergeMemberStewardship";
import {
  completeConsultationPayment,
  ensureConsultationPaymentForMember,
  getConsultationPaymentForMember,
  initializeConsultationPayment,
  updateConsultationPaymentStatus
} from "../utils/ConsultationPaymentEngine";
import { buildPaymentSummary } from "../utils/consultationPaymentLogic";
import { logPaymentEvent, setPaymentFlowState } from "../utils/paymentState";
import { PAYMENT_CONFIRM_UNAVAILABLE, PAYMENT_START_ERROR } from "../config/paystack";
import { openPaystackCheckout } from "./paymentCheckout";
import { apiUrl } from "./supabase";
import { memberApiHeaders } from "../utils/memberApiAuth";
import { readResponseJson } from "../utils/httpJson";
import { hasPaystackCallbackInUrl } from "../utils/paymentReturn";

const CONSULTATION_PAYMENT_KIND = "consultation-fee";
const DEFAULT_RETURN_PATH = SIGNAL_CONCIERGE_CONSULTATION_PATH;

export type ConsultationPaymentPhase =
  | "idle"
  | "preparing"
  | "checkout"
  | "verifying"
  | "paid"
  | "pending"
  | "failed";

type InitializePayload = {
  ok?: boolean;
  error?: string;
  reference?: string;
  authorization_url?: string;
  access_code?: string;
  paymentId?: string;
  journeyId?: string;
  returnPath?: string;
};

type VerifyPayload = {
  ok?: boolean;
  error?: string;
  pending?: boolean;
  paymentId?: string;
  memberId?: string;
  journeyId?: string;
  consultationEligible?: boolean;
  consultationUnlocked?: boolean;
  returnPath?: string;
};

export type ConsultationPaymentCheckoutResult = {
  ok: boolean;
  error?: string;
  cancelled?: boolean;
  redirected?: boolean;
  reference?: string;
  phase?: ConsultationPaymentPhase;
};

function paymentPlatform(): "native" | "web" {
  return Capacitor.isNativePlatform() ? "native" : "web";
}

function memberStubFromApplication(application: SignalConciergeApplication): ConciergeMemberRecord {
  return normalizeConciergeMember({
    ...application,
    photos: [],
    trustedMember: false,
    ownership: CONCIERGE_MEMBER_OWNERSHIP,
    stewardshipHistory: [],
    communicationJournal: [],
    flags: [],
    privateNotes: [],
    timeline: [],
    introductions: [],
    followUpTasks: []
  });
}

export function resolveConsultationPaymentMember(
  application: SignalConciergeApplication
): ConciergeMemberRecord {
  return getConciergeMember(application.id) ?? memberStubFromApplication(application);
}

export function getConsultationPaymentState(application: SignalConciergeApplication) {
  const member = resolveConsultationPaymentMember(application);
  const payment = ensureConsultationPaymentForMember(member);
  return {
    member,
    payment,
    summary: buildPaymentSummary(payment)
  };
}

function saveConsultationPaymentContext(input: {
  reference: string;
  paymentId: string;
  memberId: string;
  returnPath?: string;
}) {
  localStorage.setItem(STORAGE_KEYS.paymentReference, input.reference);
  localStorage.setItem(STORAGE_KEYS.paymentKind, CONSULTATION_PAYMENT_KIND);
  localStorage.setItem(STORAGE_KEYS.paymentProductType, CONSULTATION_PAYMENT_KIND);
  localStorage.setItem(STORAGE_KEYS.paymentProductId, input.paymentId);
  localStorage.setItem(STORAGE_KEYS.paymentReturnPath, input.returnPath || DEFAULT_RETURN_PATH);
  localStorage.setItem(STORAGE_KEYS.paymentSourcePage, input.returnPath || DEFAULT_RETURN_PATH);
  if (!localStorage.getItem(STORAGE_KEYS.paymentStartedAt)) {
    localStorage.setItem(STORAGE_KEYS.paymentStartedAt, String(Date.now()));
  }
  logPaymentEvent("consultation payment initialized", input);
}

function clearConsultationPaymentContext() {
  localStorage.removeItem(STORAGE_KEYS.paymentReference);
  localStorage.removeItem(STORAGE_KEYS.paymentKind);
  localStorage.removeItem(STORAGE_KEYS.paymentProductType);
  localStorage.removeItem(STORAGE_KEYS.paymentProductId);
  localStorage.removeItem(STORAGE_KEYS.paymentReturnPath);
  localStorage.removeItem(STORAGE_KEYS.paymentSourcePage);
  localStorage.removeItem(STORAGE_KEYS.paymentStartedAt);
}

async function postConsultationPayment(
  action: "initialize" | "verify",
  body: Record<string, unknown>
): Promise<{ response: Response; payload: InitializePayload & VerifyPayload }> {
  const response = await fetch(apiUrl(`${CONSULTATION_PAYMENTS_API_PATH}?action=${action}`), {
    method: "POST",
    headers: await memberApiHeaders(),
    body: JSON.stringify(body)
  });
  const payload = (await readResponseJson<InitializePayload & VerifyPayload>(response)) ?? {};
  return { response, payload };
}

export function deriveConsultationPaymentPhase(
  application: SignalConciergeApplication,
  flow: "idle" | "verifying" | "failed" = "idle"
): ConsultationPaymentPhase {
  const payment = getConsultationPaymentForMember(application.id);
  if (!payment) return "idle";
  if (payment.status === "paid" && payment.consultationEligibleAt) return "paid";
  if (flow === "verifying" || payment.status === "initialized") {
    return flow === "verifying" ? "verifying" : "pending";
  }
  if (payment.status === "failed" || flow === "failed") return "failed";
  return "idle";
}

export async function startConsultationPaymentCheckout(
  application: SignalConciergeApplication,
  options?: { returnPath?: string }
): Promise<ConsultationPaymentCheckoutResult> {
  const member = resolveConsultationPaymentMember(application);
  const payment = ensureConsultationPaymentForMember(member);
  if (payment.status === "paid") {
    return { ok: true, phase: "paid", reference: payment.paystackReference };
  }

  initializeConsultationPayment(member.id);
  setPaymentFlowState("initializing");

  const returnPath = options?.returnPath || DEFAULT_RETURN_PATH;
  const { response, payload: init } = await postConsultationPayment("initialize", {
    memberId: member.id,
    paymentId: payment.paymentId,
    journeyId: member.journeyId,
    returnPath,
    sourcePage: returnPath,
    platform: paymentPlatform()
  });

  if (!response.ok || !init.ok || !init.authorization_url || !init.reference) {
    setPaymentFlowState("failed");
    return { ok: false, error: init.error || PAYMENT_START_ERROR, phase: "failed" };
  }

  saveConsultationPaymentContext({
    reference: init.reference,
    paymentId: payment.paymentId,
    memberId: member.id,
    returnPath: init.returnPath || returnPath
  });

  setPaymentFlowState("checkout_open");
  const outcome = await openPaystackCheckout({
    authorizationUrl: init.authorization_url,
    reference: init.reference,
    kind: CONSULTATION_PAYMENT_KIND
  });

  if (outcome.status === "error") {
    setPaymentFlowState("failed");
    updateConsultationPaymentStatus(member.id, "failed");
    return { ok: false, error: outcome.message, phase: "failed" };
  }

  if (outcome.status === "cancelled") {
    setPaymentFlowState("cancelled");
    return { ok: false, cancelled: true, phase: "pending" };
  }

  if (outcome.status === "redirect") {
    return { ok: true, reference: init.reference, redirected: true, phase: "pending" };
  }

  setPaymentFlowState("verifying");
  return verifyConsultationPayment(application, init.reference);
}

export async function verifyConsultationPayment(
  application: SignalConciergeApplication,
  reference?: string
): Promise<ConsultationPaymentCheckoutResult> {
  const member = resolveConsultationPaymentMember(application);
  const paymentReference =
    reference?.trim() ||
    localStorage.getItem(STORAGE_KEYS.paymentReference)?.trim() ||
    new URLSearchParams(window.location.search).get("trxref") ||
    new URLSearchParams(window.location.search).get("reference") ||
    "";

  if (!paymentReference) {
    return { ok: false, error: "Payment reference is required.", phase: "failed" };
  }

  setPaymentFlowState("verifying");
  const { response, payload } = await postConsultationPayment("verify", {
    reference: paymentReference,
    memberId: member.id,
    paymentId: getConsultationPaymentForMember(member.id)?.paymentId,
    returnPath: localStorage.getItem(STORAGE_KEYS.paymentReturnPath) || DEFAULT_RETURN_PATH
  });

  if (response.status === 402 || payload.pending) {
    return { ok: false, error: payload.error || "Payment is not successful yet.", phase: "pending" };
  }

  if (response.status === 503) {
    return { ok: false, error: payload.error || PAYMENT_CONFIRM_UNAVAILABLE, phase: "pending" };
  }

  if (!response.ok || !payload.ok) {
    setPaymentFlowState("failed");
    updateConsultationPaymentStatus(member.id, "failed");
    return { ok: false, error: payload.error || PAYMENT_CONFIRM_UNAVAILABLE, phase: "failed" };
  }

  completeConsultationPayment(member.id, paymentReference);
  setPaymentFlowState("success");
  clearConsultationPaymentContext();
  logPaymentEvent("consultation payment verified", {
    reference: paymentReference,
    paymentId: payload.paymentId,
    memberId: payload.memberId,
    journeyId: payload.journeyId,
    consultationUnlocked: payload.consultationUnlocked ?? payload.consultationEligible
  });

  return {
    ok: true,
    reference: paymentReference,
    phase: "paid"
  };
}

export function consultationPaymentCallbackActive(): boolean {
  const kind = localStorage.getItem(STORAGE_KEYS.paymentKind);
  return kind === CONSULTATION_PAYMENT_KIND && hasPaystackCallbackInUrl();
}

export function consultationPaymentHumanCopy() {
  return {
    feeLabel: CONSULTATION_PAYMENT_FEE_LABEL,
    amountLabel: CONSULTATION_PAYMENT_AMOUNT_LABEL
  };
}
