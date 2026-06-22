import {
  SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT,
  SIGNAL_CONCIERGE_CONSULTATION_FEE_HEADLINE
} from "./signalConcierge";
import type {
  ConsultationPaymentGateway,
  ConsultationPaymentStatus,
  PaymentTimelineKind
} from "../types/consultationPayment";

export const CONSULTATION_PAYMENT_ENGINE_BRAND = "Consultation Payment Engine™";

/** Permanent Payment IDs — BS-PAY-YYYY-#### */
export const CONSULTATION_PAYMENT_ID_PREFIX = "BS-PAY";
export const CONSULTATION_PAYMENT_ID_PATTERN = /^BS-PAY-\d{4}-\d{4}$/;
export const CONSULTATION_PAYMENT_ID_LABEL = "Payment ID";

export const CONSULTATION_PAYMENT_FEE_LABEL = SIGNAL_CONCIERGE_CONSULTATION_FEE_HEADLINE;
export const CONSULTATION_PAYMENT_AMOUNT_LABEL = SIGNAL_CONCIERGE_CONSULTATION_FEE_AMOUNT;
export const CONSULTATION_PAYMENT_AMOUNT_NGN = 100_000;
export const CONSULTATION_PAYMENT_AMOUNT_KOBO = CONSULTATION_PAYMENT_AMOUNT_NGN * 100;
export const CONSULTATION_PAYMENT_CURRENCY = "NGN" as const;

export const CONSULTATION_PAYMENT_MEMBERSHIP_NOTE =
  "Membership fees remain separate from the consultation fee.";

export const CONSULTATION_PAYMENT_STATUS_ORDER: ConsultationPaymentStatus[] = [
  "pending",
  "initialized",
  "paid",
  "failed",
  "refunded",
  "cancelled"
];

export const CONSULTATION_PAYMENT_STATUS_LABELS: Record<ConsultationPaymentStatus, string> = {
  pending: "Awaiting payment",
  initialized: "Payment initialized",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
  cancelled: "Cancelled"
};

export const CONSULTATION_PAYMENT_STATUS_HINTS: Record<ConsultationPaymentStatus, string> = {
  pending: "Consultation fee not yet requested.",
  initialized: "Payment link prepared — member may complete at their pace.",
  paid: "Consultation fee received — thank you.",
  failed: "Payment did not complete — steward may follow up privately.",
  refunded: "Consultation fee returned to member.",
  cancelled: "Payment request withdrawn."
};

export const CONSULTATION_PAYMENT_TIMELINE_STEPS: {
  kind: PaymentTimelineKind;
  label: string;
  detail: string;
}[] = [
  { kind: "created", label: "Created", detail: "Consultation payment record opened." },
  {
    kind: "payment-initialized",
    label: "Payment Initialized",
    detail: "Member may complete the consultation fee privately."
  },
  {
    kind: "payment-completed",
    label: "Payment Completed",
    detail: "Consultation fee received — permanent record."
  },
  {
    kind: "consultation-eligible",
    label: "Consultation Eligible",
    detail: "Member may proceed to their private consultation."
  }
];

export const CONSULTATION_PAYMENT_TERMINAL_TIMELINE: Partial<
  Record<ConsultationPaymentStatus, { kind: PaymentTimelineKind; label: string; detail: string }>
> = {
  failed: {
    kind: "payment-failed",
    label: "Payment Failed",
    detail: "Consultation fee was not completed."
  },
  refunded: {
    kind: "payment-refunded",
    label: "Payment Refunded",
    detail: "Consultation fee returned."
  },
  cancelled: {
    kind: "payment-cancelled",
    label: "Payment Cancelled",
    detail: "Consultation fee request withdrawn."
  }
};

export const CONSULTATION_PAYMENT_FUTURE_GATEWAYS: {
  id: ConsultationPaymentGateway;
  label: string;
}[] = [
  { id: "paystack", label: "Paystack" },
  { id: "flutterwave", label: "Flutterwave" },
  { id: "stripe", label: "Stripe" }
];

export const CONSULTATION_PAYMENT_FUTURE_CAPABILITIES = [
  { id: "international-currencies" as const, label: "International currencies" },
  { id: "discount-codes" as const, label: "Discount codes" },
  { id: "scholarships" as const, label: "Scholarships" }
];

/**
 * Future-ready architecture hooks — not implemented.
 * Wire `ConsultationPaymentFutureConfig` when gateway integrations are enabled.
 */
export const CONSULTATION_PAYMENT_FUTURE_ARCHITECTURE = {
  paystack: "Initialize and verify consultation fee via existing Paystack rails.",
  flutterwave: "Alternate Nigerian gateway adapter behind the same payment record.",
  stripe: "International consultation fee collection with currency conversion.",
  internationalCurrencies: "Store amount + display currency alongside NGN ledger.",
  discountCodes: "Apply reductions without mutating permanent payment IDs.",
  scholarships: "Waive or partially cover consultation fee with audit trail."
} as const;

export function formatConsultationPaymentId(year: number, sequence: number): string {
  return `${CONSULTATION_PAYMENT_ID_PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function isValidConsultationPaymentId(value: string): boolean {
  return CONSULTATION_PAYMENT_ID_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeConsultationPaymentId(value: string): string {
  return value.trim().toUpperCase();
}

export function parseConsultationPaymentId(value: string): { year: number; sequence: number } | null {
  const trimmed = value.trim().toUpperCase();
  const match = trimmed.match(/^BS-PAY-(\d{4})-(\d{4})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const sequence = Number(match[2]);
  if (sequence < 1) return null;
  return { year, sequence };
}

export function consultationPaymentIdYearFromDate(
  isoDate: string,
  fallbackYear = new Date().getFullYear()
): number {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return fallbackYear;
  return new Date(parsed).getUTCFullYear();
}
